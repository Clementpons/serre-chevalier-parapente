import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  finalizeOrder,
  allocatePaymentToOrderItems,
} from "@/lib/order-processing";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  if (!stripe) {
    console.error("Stripe not configured");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    console.log(
      `[WEBHOOK] 📨 Received event: ${event.id} - Type: ${event.type}`,
    );

    // IDEMPOTENCE: créer l'enregistrement de façon atomique
    try {
      await prisma.processedWebhookEvent.create({
        data: {
          stripeEventId: event.id,
          eventType: event.type,
        },
      });
      console.log(`[WEBHOOK] ✅ Event ${event.id} is NEW — Processing...`);
    } catch (error: any) {
      if (error.code === "P2002") {
        const existingEvent = await prisma.processedWebhookEvent.findUnique({
          where: { stripeEventId: event.id },
        });
        console.log(
          `[WEBHOOK] ⛔ Event ${event.id} ALREADY PROCESSED at ${existingEvent?.processedAt} — SKIPPING`,
        );
        return NextResponse.json({
          received: true,
          message: "Event already processed",
        });
      }
      throw error;
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;
      }
      default:
        console.log(`[WEBHOOK] ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log(`[WEBHOOK] ✅ Event ${event.id} processed successfully`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  const customerEmail = paymentIntent.metadata.customerEmail;
  const customerDataStr = paymentIntent.metadata.customerData;

  if (!orderId) {
    console.error("[WEBHOOK] No orderId in payment intent metadata");
    return;
  }

  console.log(`[WEBHOOK] Processing successful payment for order: ${orderId}`);

  // IDEMPOTENCE: vérifier si la commande a déjà été traitée
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, id: true, clientId: true },
  });

  if (
    existingOrder &&
    (existingOrder.status === "PAID" ||
      existingOrder.status === "PARTIALLY_PAID")
  ) {
    console.log(
      `[WEBHOOK] Order ${orderId} already processed — status: ${existingOrder.status}`,
    );
    return;
  }

  // 1. Créer ou mettre à jour le client
  let client = null;
  if (customerEmail) {
    client = await prisma.client.findUnique({ where: { email: customerEmail } });

    if (customerDataStr) {
      try {
        const customerData = JSON.parse(customerDataStr);
        const clientData = {
          email: customerEmail,
          firstName: customerData.firstName || "",
          lastName: customerData.lastName || "",
          phone: customerData.phone || "",
          address: customerData.address || "",
          postalCode: customerData.postalCode || "",
          city: customerData.city || "",
          country: customerData.country || "France",
        };

        if (!client) {
          client = await prisma.client.create({ data: clientData });
          console.log(`[WEBHOOK] Client created: ${client.id}`);
        } else {
          client = await prisma.client.update({
            where: { email: customerEmail },
            data: clientData,
          });
          console.log(`[WEBHOOK] Client updated: ${client.id}`);
        }
      } catch (parseError) {
        console.error("[WEBHOOK] Error parsing customer data:", parseError);
      }
    }
  }

  // 2. Récupérer la commande complète
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: { include: { stage: true, bapteme: true } },
    },
  });

  if (!order) throw new Error("Order not found");

  // 3. Mettre à jour le paiement si nécessaire
  const existingPayment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
    select: { id: true, status: true },
  });

  if (!existingPayment) throw new Error("Payment not found");

  let payment = existingPayment as any;
  if (existingPayment.status !== "SUCCEEDED") {
    payment = await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntent.id },
      data: { status: "SUCCEEDED", paymentType: "STRIPE" },
    });
    console.log(`[WEBHOOK] Payment ${payment.id} → SUCCEEDED`);
  }

  // 4. Allouer le paiement (idempotent)
  const existingAllocations = await prisma.paymentAllocation.findMany({
    where: { paymentId: payment.id },
  });

  if (existingAllocations.length === 0) {
    await allocatePaymentToOrderItems(payment, order.orderItems);
  }

  // 5. Déterminer le nouveau statut de la commande
  const hasRemainingAmount = order.orderItems.some(
    (item) =>
      (item.type === "STAGE" || item.type === "BAPTEME") &&
      item.remainingAmount &&
      item.remainingAmount > 0,
  );
  const newStatus = hasRemainingAmount ? "PARTIALLY_PAID" : "PAID";

  // 6. Mettre à jour la commande
  const needsUpdate =
    order.status !== newStatus ||
    (client && order.clientId !== client.id);

  let updatedOrder;
  if (needsUpdate) {
    updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(client && order.clientId !== client.id && { clientId: client.id }),
      },
      include: {
        orderItems: { include: { stage: true, bapteme: true } },
        client: true,
      },
    });
  } else {
    updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: { include: { stage: true, bapteme: true } },
        client: true,
      },
    });
  }

  if (!updatedOrder) throw new Error("Order not found after update");

  // 7. Finaliser (réservations + emails + panier)
  const sessionId = paymentIntent.metadata.sessionId;
  await finalizeOrder(updatedOrder, sessionId);

  console.log(
    `[WEBHOOK] ✅ Order ${updatedOrder.orderNumber} finalized — status: ${newStatus}`,
  );
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  if (!orderId) {
    console.error("[WEBHOOK] No orderId in failed payment metadata");
    return;
  }

  await prisma.payment.update({
    where: { stripePaymentIntentId: paymentIntent.id },
    data: { status: "FAILED" },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  console.log(`[WEBHOOK] Payment failed — order ${orderId} cancelled`);
}
