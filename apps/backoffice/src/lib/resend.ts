import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';
import { AdminNewOrderEmail } from '@/emails/admin-new-order';
import { GiftVoucherPurchaseEmail } from '@/emails/gift-voucher-purchase';
import { ResetPasswordEmail } from '@/emails/reset-password';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  orderNumber: string;
  orderDate: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderItems: any[];
  depositTotal: number;
  remainingTotal: number;
  totalAmount: number;
  discountAmount?: number;
  promoDiscountAmount?: number;
  promoCode?: string | null;
  futurePayments: Array<{
    amount: number;
    date: string;
    description: string;
    participantName: string;
  }>;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';

    const { data: emailData, error } = await resend.emails.send({
      from: sender,
      to: [data.customerEmail],
      subject: `Confirmation de réservation - Commande ${data.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        orderItems: data.orderItems,
        depositTotal: data.depositTotal,
        remainingTotal: data.remainingTotal,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        futurePayments: data.futurePayments,
      }),
    });

    if (error) {
      throw error;
    }
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    throw error;
  }
}

export async function sendAdminNewOrderEmail(data: OrderEmailData) {
  try {
    const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';
    const adminEmail = process.env.ADMIN_EMAIL || '';

    const { data: emailData, error } = await resend.emails.send({
      from: sender,
      to: [adminEmail],
      subject: `Nouvelle commande reçue ! - ${data.orderNumber}`,
      react: AdminNewOrderEmail({
        orderNumber: data.orderNumber,
        orderDate: data.orderDate,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        orderItems: data.orderItems,
        depositTotal: data.depositTotal,
        remainingTotal: data.remainingTotal,
        totalAmount: data.totalAmount,
        discountAmount: data.discountAmount || 0,
        promoDiscountAmount: data.promoDiscountAmount || 0,
        promoCode: data.promoCode ?? undefined,
      }),
    });

    if (error) {
      throw error;
    }
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    throw error;
  }
}

interface GiftVoucherEmailData {
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  recipientEmail?: string;
  notifyRecipient: boolean;
  personalMessage?: string;
  voucherCode: string;
  voucherType: string;
  expiryDate: string;
  purchaseDate: string;
  orderNumber: string;
}

export async function sendPasswordResetEmail({
  userName,
  userEmail,
  resetUrl,
}: {
  userName: string;
  userEmail: string;
  resetUrl: string;
}) {
  const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';
  const { error } = await resend.emails.send({
    from: sender,
    to: [userEmail],
    subject: 'Réinitialisation de votre mot de passe',
    react: ResetPasswordEmail({ userName, resetUrl }),
  });
  if (error) throw error;
}

export async function sendGiftVoucherPurchaseEmail(data: GiftVoucherEmailData) {
  try {
    const sender = process.env.RESEND_FROM_EMAIL || 'Serre Chevalier Parapente <noreply@serre-chevalier-parapente.fr>';

    // Déterminer le destinataire selon notifyRecipient
    const recipientEmail = data.notifyRecipient ? data.recipientEmail : data.buyerEmail;
    const subject = data.notifyRecipient
      ? `🎁 Bon cadeau de ${data.buyerName} !`
      : `Votre bon cadeau pour ${data.recipientName} est prêt !`;

    const { data: emailData, error } = await resend.emails.send({
      from: sender,
      to: [recipientEmail!],
      subject,
      react: GiftVoucherPurchaseEmail({
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail,
        notifyRecipient: data.notifyRecipient,
        personalMessage: data.personalMessage,
        voucherCode: data.voucherCode,
        voucherType: data.voucherType,
        expiryDate: data.expiryDate,
        purchaseDate: data.purchaseDate,
        orderNumber: data.orderNumber,
      }),
    });

    if (error) {
      throw error;
    }
    return { success: true, emailId: emailData?.id };
  } catch (error) {
    throw error;
  }
}