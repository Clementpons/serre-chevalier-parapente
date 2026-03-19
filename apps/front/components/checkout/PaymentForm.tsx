'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentFormProps {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

export function PaymentForm({ 
  clientSecret, 
  orderId, 
  orderNumber, 
  totalAmount, 
  onSuccess, 
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log('[PAYMENT FORM] 💳 Payment form submitted', {
      timestamp: new Date().toISOString(),
      orderId,
      orderNumber,
      totalAmount,
      stripeLoaded: !!stripe,
      elementsLoaded: !!elements,
    });

    if (!stripe || !elements) {
      console.log('[PAYMENT FORM] ❌ Stripe or Elements not loaded');
      onError('Stripe n\'est pas encore chargé');
      return;
    }

    setIsLoading(true);

    try {
      console.log('[PAYMENT FORM] 🔄 Confirming payment with Stripe', {
        returnUrl: `${window.location.origin}/checkout/success?order=${orderId}`,
      });

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?order=${orderId}`,
        },
        redirect: 'if_required',
      });

      console.log('[PAYMENT FORM] 📥 Stripe response received', {
        hasError: !!error,
        errorMessage: error?.message,
        paymentIntentId: paymentIntent?.id,
        paymentIntentStatus: paymentIntent?.status,
      });

      if (error) {
        console.log('[PAYMENT FORM] ❌ Payment error', { error: error.message });
        onError(error.message || 'Une erreur est survenue lors du paiement');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[PAYMENT FORM] ✅ Payment succeeded, calling onSuccess', {
          paymentIntentId: paymentIntent.id,
        });
        // Le webhook Stripe s'occupe de la confirmation côté serveur
        onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('[PAYMENT FORM] ❌ Exception during payment', err);
      onError('Erreur lors du traitement du paiement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Paiement sécurisé
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Récapitulatif */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Commande {orderNumber}</p>
                <p className="text-sm text-gray-600">Paiement sécurisé par Stripe</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{totalAmount.toFixed(2)}€</p>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informations de paiement</h3>
            <PaymentElement 
              options={{
                layout: 'tabs',
                paymentMethodOrder: ['card', 'paypal'],
              }}
            />
          </div>

          {/* Adresse de facturation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Adresse de facturation</h3>
            <AddressElement
              options={{
                mode: 'billing',
                allowedCountries: ['FR', 'BE', 'CH', 'IT', 'ES', 'DE'],
                defaultValues: {
                  address: {
                    country: 'FR',
                  },
                },
              }}
            />
          </div>

          {/* Sécurité */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Lock className="w-4 h-4" />
            <span>Paiement 100% sécurisé par Stripe</span>
          </div>

          {/* Bouton de paiement */}
          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Traitement en cours...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Payer {totalAmount.toFixed(2)}€
              </>
            )}
          </Button>

          {/* Informations légales */}
          <div className="text-xs text-gray-500 text-center">
            <p>En cliquant sur "Payer", vous acceptez nos conditions générales de vente.</p>
            <p>Aucun prélèvement ne sera effectué avant confirmation de votre réservation.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}