import "server-only";
import Stripe from 'stripe';

// Stripe optionnel pour les tests
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Configuration des métadonnées pour traçabilité
export const createPaymentIntent = async (order: {
  id: string;
  orderNumber: string;
  totalAmount: number;
  sessionId?: string; // ID de session du panier pour vider le panier après paiement
  customerEmail?: string; // Email du client pour créer le client après paiement
  customerData?: any; // Données complètes du client
}) => {
  if (!stripe) {
    // Mode test sans Stripe - Générer un client_secret au format valide
    const timestamp = Date.now();
    const randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
      id: `pi_test_${timestamp}`,
      client_secret: `pi_test_${timestamp}_secret_${randomSecret}`,
      amount: Math.round(order.totalAmount * 100),
    };
  }

  // Préparer les métadonnées (Stripe limite à 500 caractères par valeur)
  const metadata: Record<string, string> = {
    orderId: order.id,
    orderNumber: order.orderNumber,
  };

  if (order.sessionId) {
    metadata.sessionId = order.sessionId;
  }

  if (order.customerEmail) {
    metadata.customerEmail = order.customerEmail;
  }

  // Stocker les données client en JSON (si elles existent)
  if (order.customerData) {
    metadata.customerData = JSON.stringify(order.customerData);
  }

  return await stripe!.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100), // Centimes
    currency: 'eur',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });
};

// Fonction pour générer un numéro de commande unique
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  
  return `ORD-${year}-${timestamp}${random}`;
}

// Validation du montant de paiement
export const validatePaymentAmount = (paymentIntent: Stripe.PaymentIntent, expectedAmount: number) => {
  const expectedAmountCents = Math.round(expectedAmount * 100);
  return paymentIntent.amount === expectedAmountCents;
};

// Gestion des erreurs Stripe
export const handleStripeError = (error: any): string => {
  switch (error.code) {
    case 'card_declined':
      return 'Votre carte a été refusée. Veuillez essayer avec une autre carte.';
    case 'insufficient_funds':
      return 'Fonds insuffisants sur votre carte.';
    case 'expired_card':
      return 'Votre carte a expiré.';
    case 'incorrect_cvc':
      return 'Code de sécurité incorrect.';
    case 'processing_error':
      return 'Erreur de traitement. Veuillez réessayer.';
    default:
      return 'Une erreur de paiement est survenue. Veuillez réessayer.';
  }
};

// Créer un Payment Intent avec clé d'idempotence
export const createPaymentWithIdempotency = async (order: {
  id: string;
  orderNumber: string;
  totalAmount: number;
  customerEmail: string;
}) => {
  if (!stripe) {
    // Mode test sans Stripe - Générer un client_secret au format valide
    const timestamp = Date.now();
    const randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return {
      id: `pi_test_${timestamp}`,
      client_secret: `pi_test_${timestamp}_secret_${randomSecret}`,
      amount: Math.round(order.totalAmount * 100),
    };
  }

  return await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'eur',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
    },
  }, {
    idempotencyKey: `order-${order.id}-${Date.now()}`,
  });
};