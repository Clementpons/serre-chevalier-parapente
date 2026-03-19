'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StripeProvider } from '@/components/providers/StripeProvider';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CheckCircle, AlertTriangle, CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useBaptemePrices } from '@/hooks/useBaptemePrices';

function PaymentPageContent() {
  const { videoOptionPrice, loading: pricesLoading } = useBaptemePrices();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const clientSecretParam = searchParams.get('client_secret');

  const [order, setOrder] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>(clientSecretParam || '');
  const [remainingPayments, setRemainingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const loadOrderDetails = async (orderIdParam: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/orders/${orderIdParam}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
      });
      const data = await response.json();

      if (data.success) {
        const orderData = data.data;
        let depositAmount = 0;
        let remainingAmount = 0;
        const remainingPaymentsList: any[] = [];

        orderData.orderItems?.forEach((item: any) => {
          if (item.participantData?.usedGiftVoucherCode) return;

          if (item.type === 'STAGE' && item.stage) {
            // Utiliser effectiveDepositAmount (post-promo) si disponible, sinon acomptePrice brut
            const stageDeposit = item.effectiveDepositAmount ?? item.stage.acomptePrice ?? Math.round(item.stage.price * 0.33);
            depositAmount += stageDeposit;
            // Solde = prix total - acompte effectif (- promo déjà dans effectiveDeposit)
            const remaining = item.effectiveRemainingAmount ?? (item.stage.price - (item.depositAmount ?? item.stage.acomptePrice ?? 0));
            if (remaining > 0) {
              remainingAmount += remaining;
              remainingPaymentsList.push({
                type: 'STAGE',
                itemType: item.stage.type,
                itemDate: item.stage.startDate,
                remainingAmount: remaining,
                participantName: `${item.participantData?.firstName || ''} ${item.participantData?.lastName || ''}`.trim(),
              });
            }
          } else if (item.type === 'BAPTEME' && item.bapteme) {
            const videoPrice = item.participantData?.hasVideo ? videoOptionPrice : 0;
            const baptemeDeposit = item.effectiveDepositAmount ?? (item.bapteme.acomptePrice || 35) + videoPrice;
            depositAmount += baptemeDeposit;
            const remaining = item.effectiveRemainingAmount ?? (item.totalPrice - videoPrice - (item.bapteme.acomptePrice || 35));
            if (remaining > 0) {
              remainingAmount += remaining;
              remainingPaymentsList.push({
                type: 'BAPTEME',
                itemType: item.participantData?.selectedCategory || '',
                itemDate: item.bapteme.date,
                remainingAmount: remaining,
                participantName: `${item.participantData?.firstName || ''} ${item.participantData?.lastName || ''}`.trim(),
              });
            }
          } else {
            depositAmount += item.totalPrice;
          }
        });

        setOrder({ ...orderData, depositAmount, remainingAmount });
        setRemainingPayments(remainingPaymentsList);

        if (!clientSecretParam) {
          toast({
            title: 'Erreur',
            description: 'Client secret manquant. Veuillez recommencer le processus de paiement.',
            variant: 'destructive',
          });
        }
      } else {
        toast({ title: 'Erreur', description: 'Commande introuvable', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur chargement commande:', error);
      toast({ title: 'Erreur', description: 'Erreur lors du chargement de la commande', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log('[PAYMENT SUCCESS] 🎉', { orderId, paymentIntentId: paymentIntent?.id });
    setPaymentSuccess(true);
    toast({ title: 'Paiement réussi !', description: 'Votre réservation a été confirmée' });
    setTimeout(() => {
      window.location.href = `/checkout/success?order=${orderId}`;
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    toast({ title: 'Erreur de paiement', description: error, variant: 'destructive' });
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  // ── États de chargement / erreur ────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du paiement...</p>
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-gray-600 mb-6">La commande demandée n&apos;existe pas ou a expiré</p>
          <Button onClick={() => (window.location.href = '/')}>Retour à l&apos;accueil</Button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold mb-2">Paiement non requis</h1>
          <p className="text-gray-600 mb-6">Cette commande ne nécessite pas de paiement</p>
          <Button onClick={() => (window.location.href = `/checkout/success?order=${orderId}`)}>
            Voir ma confirmation
          </Button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Paiement réussi !</h1>
          <p className="text-gray-500">Redirection vers la confirmation…</p>
        </div>
      </div>
    );
  }

  const todayAmount = (order.depositAmount || order.totalAmount) as number;

  // ── Page principale ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de progression — étape 3 active */}
      <div className="bg-white border-b shadow-sm pt-16">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            {/* Étape 1 — complétée */}
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm font-medium hidden sm:block">Panier</span>
            </div>
            <div className="h-px w-10 bg-emerald-400" />
            {/* Étape 2 — complétée */}
            <div className="flex items-center gap-2 text-emerald-600">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
              <span className="text-sm font-medium hidden sm:block">Informations</span>
            </div>
            <div className="h-px w-10 bg-blue-400" />
            {/* Étape 3 — active */}
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm font-medium hidden sm:block">Paiement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne gauche — Formulaire Stripe (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Paiement sécurisé
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Commande <span className="font-mono font-semibold text-gray-700">{order.orderNumber}</span> — {order.customerEmail}
                </p>
              </div>

              <div className="p-6">
                {clientSecret ? (
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      clientSecret={clientSecret}
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      totalAmount={todayAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                    <p className="text-gray-600 mb-4">Erreur lors de l&apos;initialisation du paiement</p>
                    <Button onClick={() => window.location.reload()}>Réessayer</Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Colonne droite — Récapitulatif sticky (1/3) */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit">

            {/* Résumé commande */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-gray-400" />
                Récapitulatif
              </h3>

              {/* Lignes articles */}
              <div className="space-y-2">
                {order.orderItems
                  ?.filter((item: any) => !item.participantData?.usedGiftVoucherCode)
                  .map((item: any, index: number) => {
                    const name =
                      item.type === 'GIFT_VOUCHER'
                        ? item.participantData?.recipientName || 'destinataire'
                        : `${item.participantData?.firstName || ''} ${item.participantData?.lastName || ''}`.trim();

                    let label = '';
                    let amount = 0;

                    const promoShare = item.discountAmount ?? 0;

                    if (item.type === 'STAGE' && item.stage) {
                      label = `Acompte — Stage ${item.stage.type} · ${formatDate(item.stage.startDate)}`;
                      // effectiveDepositAmount = acompte réel post-promo
                      amount = item.effectiveDepositAmount ?? item.stage.acomptePrice ?? Math.round(item.stage.price * 0.33);
                    } else if (item.type === 'BAPTEME' && item.bapteme) {
                      const videoPrice = item.participantData?.hasVideo ? videoOptionPrice : 0;
                      label = `Acompte — Baptême ${item.participantData?.selectedCategory} · ${formatDate(item.bapteme.date)}`;
                      amount = item.effectiveDepositAmount ?? (item.bapteme.acomptePrice || 35) + videoPrice;
                    } else if (item.type === 'GIFT_VOUCHER') {
                      label = item.participantData?.voucherProductType === 'STAGE'
                        ? `Bon cadeau Stage ${item.participantData.voucherStageCategory}`
                        : `Bon cadeau Baptême ${item.participantData.voucherBaptemeCategory}`;
                      amount = item.totalPrice;
                    }

                    return (
                      <div key={index} className="space-y-0.5">
                        <div className="flex justify-between text-xs text-gray-600">
                          <div className="truncate mr-2">
                            <p className="leading-tight">{label}</p>
                            <p className="text-gray-400">{name}</p>
                          </div>
                          <span className="font-medium whitespace-nowrap">{amount.toFixed(2)}€</span>
                        </div>
                        {promoShare > 0 && (
                          <div className="flex justify-between text-xs text-green-600 pl-2">
                            <span>Réduction code promo</span>
                            <span>-{promoShare.toFixed(2)}€</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {/* Bons cadeaux appliqués */}
                {order.orderItems
                  ?.filter((item: any) => item.participantData?.usedGiftVoucherCode)
                  .map((item: any, index: number) => {
                    const name = `${item.participantData?.firstName || ''} ${item.participantData?.lastName || ''}`.trim();
                    const label = item.type === 'STAGE' && item.stage
                      ? `Stage ${item.stage.type} · ${formatDate(item.stage.startDate)}`
                      : `Baptême ${item.participantData?.selectedCategory} · ${formatDate(item.bapteme?.date)}`;
                    return (
                      <div key={`gc-${index}`} className="flex justify-between text-xs text-green-600">
                        <div className="truncate mr-2">
                          <p className="leading-tight">{label} (bon cadeau)</p>
                          <p className="text-green-400">{name}</p>
                        </div>
                        <span className="font-medium">0€</span>
                      </div>
                    );
                  })}
              </div>

              <Separator />

              <div className="flex justify-between items-baseline">
                <p className="font-bold text-gray-900 text-sm">À payer aujourd&apos;hui</p>
                <span className="text-xl font-bold text-blue-600">{todayAmount.toFixed(2)}€</span>
              </div>
            </div>

            {/* Bloc info acompte / solde */}
            {order.remainingAmount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-amber-500 text-base leading-none mt-0.5">ℹ️</span>
                  <div className="space-y-1.5 text-xs text-amber-900">
                    <p>
                      <strong>Acompte de {todayAmount.toFixed(2)}€</strong> à régler maintenant pour confirmer votre réservation.
                    </p>
                    <p>
                      Le solde de <strong>{order.remainingAmount.toFixed(2)}€</strong> sera réglé directement sur place le jour de votre activité.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Signaux de confiance */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <span>🔒 Paiement sécurisé SSL</span>
              <span>•</span>
              <span>Stripe</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement du paiement...</p>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
