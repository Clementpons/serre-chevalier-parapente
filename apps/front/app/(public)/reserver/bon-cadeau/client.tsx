'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Gift, ShoppingCart, ArrowLeft, ArrowRight, Plus, Loader2, Check, X } from 'lucide-react';
import { SessionManager } from '@/lib/sessionManager';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const GIFT_VOUCHER_PRODUCTS = [
  // STAGES
  {
    id: 'stage-initiation',
    productType: 'STAGE',
    category: 'INITIATION',
    label: 'Stage Initiation',
    description: 'Formation complète en parapente, idéale pour débuter.',
    duration: '5 jours',
  },
  {
    id: 'stage-progression',
    productType: 'STAGE',
    category: 'PROGRESSION',
    label: 'Stage Progression',
    description: 'Perfectionnez vos techniques et gagnez en autonomie.',
    duration: '5 jours',
  },
  {
    id: 'stage-autonomie',
    productType: 'STAGE',
    category: 'AUTONOMIE',
    label: 'Stage Autonomie',
    description: 'Volez en toute liberté sous la supervision de moniteurs.',
    duration: '5 jours',
  },
  // BAPTEMES
  {
    id: 'bapteme-aventure',
    productType: 'BAPTEME',
    category: 'AVENTURE',
    label: 'Baptême Aventure',
    description: 'Liberté, frissons et vue imprenable sur les Alpes.',
    duration: '15 min',
  },
  {
    id: 'bapteme-duree',
    productType: 'BAPTEME',
    category: 'DUREE',
    label: 'Baptême Durée',
    description: 'Plus long, plus haut, plus fort. Adrénaline garantie.',
    duration: '30 min',
  },
  {
    id: 'bapteme-longue-duree',
    productType: 'BAPTEME',
    category: 'LONGUE_DUREE',
    label: 'Baptême Longue Durée',
    description: 'Plus on reste dans le ciel, plus le plaisir grandit.',
    duration: '45 min',
  },
  {
    id: 'bapteme-enfant',
    productType: 'BAPTEME',
    category: 'ENFANT',
    label: 'Baptême Enfant',
    description: "Pour les p'tits loups dans l'aventure et la montagne.",
    duration: '10 min',
  },
  {
    id: 'bapteme-hiver',
    productType: 'BAPTEME',
    category: 'HIVER',
    label: 'Baptême Hiver',
    description: 'Les sommets enneigés à perte de vue, en toute liberté.',
    duration: 'Variable',
  },
];

interface GiftVoucherFormData {
  recipientName: string;
  recipientEmail: string;
  buyerName: string;
  buyerEmail: string;
  personalMessage: string;
}

// ─── Gift Voucher Banner ──────────────────────────────────────────────────────

function UseVoucherBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="flex items-center gap-3 justify-between bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <Gift className="w-5 h-5 text-cyan-600 shrink-0" />
        <p className="text-sm text-cyan-800 font-medium">
          Vous avez déjà un bon cadeau ? Utilisez-le dès maintenant.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/utiliser-bon-cadeau">
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 gap-1 text-xs hidden sm:flex">
            Utiliser mon bon cadeau <ArrowRight className="w-3 h-3" />
          </Button>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-xs sm:hidden">
            Utiliser
          </Button>
        </Link>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 text-cyan-500 hover:text-cyan-800 transition-colors rounded"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BonCadeauReservationClientPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [notifyRecipient, setNotifyRecipient] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<GiftVoucherFormData>();
  const { toast } = useToast();

  const productPrice = selectedProduct ? (prices[selectedProduct] ?? null) : null;

  useEffect(() => {
    const fetchAllPrices = async () => {
      setLoadingPrices(true);
      const results = await Promise.allSettled(
        GIFT_VOUCHER_PRODUCTS.map(async (product) => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/giftvouchers/price/${product.productType}/${product.category}`,
            { headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' } }
          );
          const data = await response.json();
          return { id: product.id, price: data.success ? data.data.price : null };
        })
      );
      const map: Record<string, number> = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value.price !== null) {
          map[r.value.id] = r.value.price;
        }
      });
      setPrices(map);
      setLoadingPrices(false);
    };
    fetchAllPrices();
  }, []);

  const onSubmit = async (data: GiftVoucherFormData) => {
    if (!selectedProduct || !productPrice) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un produit', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const sessionId = SessionManager.getOrCreateSessionId();
      const product = GIFT_VOUCHER_PRODUCTS.find(p => p.id === selectedProduct);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({
          type: 'GIFT_VOUCHER',
          giftVoucherAmount: productPrice,
          participantData: {
            firstName: data.buyerName.split(' ')[0] || data.buyerName,
            lastName: data.buyerName.split(' ').slice(1).join(' ') || '',
            email: data.buyerEmail,
            phone: '',
            weight: 0,
            height: 0,
            voucherProductType: product?.productType,
            voucherBaptemeCategory: product?.productType === 'BAPTEME' ? product.category : undefined,
            voucherStageCategory: product?.productType === 'STAGE' ? product.category : undefined,
            recipientName: data.recipientName,
            recipientEmail: data.recipientEmail,
            buyerName: data.buyerName,
            buyerEmail: data.buyerEmail,
            personalMessage: data.personalMessage || '',
            notifyRecipient: notifyRecipient,
          },
          quantity: 1,
        }),
      });

      const result = await response.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
        setShowSuccessDialog(true);
      } else {
        toast({ title: 'Erreur', description: result.message || "Erreur lors de l'ajout du bon cadeau", variant: 'destructive' });
      }
    } catch (error) {
      console.error('Erreur ajout bon cadeau:', error);
      toast({ title: 'Erreur', description: "Erreur lors de l'ajout du bon cadeau", variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const stages = GIFT_VOUCHER_PRODUCTS.filter(p => p.productType === 'STAGE');
  const baptemes = GIFT_VOUCHER_PRODUCTS.filter(p => p.productType === 'BAPTEME');

  const ProductButton = ({ product }: { product: typeof GIFT_VOUCHER_PRODUCTS[0] }) => {
    const isSelected = selectedProduct === product.id;
    const price = prices[product.id];
    return (
      <button
        type="button"
        onClick={() => setSelectedProduct(product.id)}
        className={cn(
          'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
          isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300',
        )}
      >
        <div className={cn(
          'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          isSelected ? 'bg-blue-600 border-transparent' : 'border-slate-300 bg-white',
        )}>
          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className={cn('font-semibold text-sm', isSelected ? 'text-blue-700' : 'text-slate-700')}>
              {product.label}
            </p>
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full border',
              isSelected ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200',
            )}>
              {product.duration}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">{product.description}</p>
          {loadingPrices ? (
            <Loader2 className="w-3 h-3 animate-spin text-slate-400 mt-1" />
          ) : price ? (
            <p className={cn('text-sm font-bold mt-1', isSelected ? 'text-blue-600' : 'text-slate-700')}>{price}€</p>
          ) : null}
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 pt-12">
        <div className="max-w-4xl mx-auto pl-16 pr-20 sm:px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/reserver">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
              Offrir un Bon Cadeau
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 space-y-8">

        <UseVoucherBanner />

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Choisissez le bon cadeau à offrir</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Offrez à vos proches une place complète dans un stage ou baptême parapente
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* Stages */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-800">Stages de parapente</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stages.map(p => <ProductButton key={p.id} product={p} />)}
            </div>
          </div>

          {/* Baptêmes */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-slate-800">Baptêmes de l&apos;air</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {baptemes.map(p => <ProductButton key={p.id} product={p} />)}
            </div>
          </div>

          <Separator />

          {/* Bénéficiaire */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Informations du bénéficiaire</h2>
              <p className="text-slate-500 text-sm">La personne qui recevra le bon cadeau</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Destinataire</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName">Nom du bénéficiaire *</Label>
                  <Input
                    id="recipientName"
                    {...register('recipientName', { required: 'Nom requis' })}
                    placeholder="Jean Dupont"
                    className="mt-1"
                  />
                  {errors.recipientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.recipientName.message}</p>
                  )}
                </div>
                {notifyRecipient && (
                  <div>
                    <Label htmlFor="recipientEmail">Email du bénéficiaire *</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      {...register('recipientEmail', {
                        required: notifyRecipient ? 'Email requis' : false,
                        pattern: notifyRecipient ? {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email invalide',
                        } : undefined,
                      })}
                      placeholder="jean@exemple.com"
                      className="mt-1"
                    />
                    {errors.recipientEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.recipientEmail.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Notification option */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="notifyRecipient"
                  checked={notifyRecipient}
                  onChange={(e) => {
                    setNotifyRecipient(e.target.checked);
                    if (!e.target.checked) {
                      setValue('recipientEmail', '');
                      setValue('personalMessage', '');
                    }
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <Label htmlFor="notifyRecipient" className="cursor-pointer font-medium text-slate-700">
                    Prévenir le bénéficiaire par email
                  </Label>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {notifyRecipient
                      ? 'Le bénéficiaire recevra un email avec son bon cadeau'
                      : "Vous recevrez le bon cadeau et pourrez l'offrir vous-même"}
                  </p>
                </div>
              </div>

              {notifyRecipient && (
                <div className="pt-3 border-t border-slate-200">
                  <Label htmlFor="personalMessage" className="text-sm font-medium text-slate-700">
                    Message personnalisé (optionnel)
                  </Label>
                  <Textarea
                    id="personalMessage"
                    {...register('personalMessage')}
                    placeholder="Ce message sera inclus dans l'email envoyé au bénéficiaire"
                    rows={4}
                    maxLength={2000}
                    className="mt-2"
                  />
                  <p className="text-xs text-slate-400 mt-1">Maximum 2000 caractères</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Acheteur */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">Vos informations</h2>
              <p className="text-slate-500 text-sm">La confirmation de commande vous sera envoyée par email</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">Acheteur</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerName">Votre nom *</Label>
                  <Input
                    id="buyerName"
                    {...register('buyerName', { required: 'Nom requis' })}
                    placeholder="Marie Martin"
                    className="mt-1"
                  />
                  {errors.buyerName && (
                    <p className="text-red-500 text-sm mt-1">{errors.buyerName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="buyerEmail">Votre email *</Label>
                  <Input
                    id="buyerEmail"
                    type="email"
                    {...register('buyerEmail', { required: 'Email requis' })}
                    placeholder="marie@exemple.com"
                    className="mt-1"
                  />
                  {errors.buyerEmail && (
                    <p className="text-red-500 text-sm mt-1">{errors.buyerEmail.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Récapitulatif & envoi */}
          <div className="space-y-4">
            <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Gift className="w-4 h-4 text-blue-600" />
                Informations importantes
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 shrink-0">•</span>
                  <span>Le bon cadeau sera <strong>valable un an</strong> à compter de la date d&apos;achat.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 shrink-0">•</span>
                  <span>Il couvre <strong>100% du prix</strong> d&apos;une place pour le produit sélectionné.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5 shrink-0">•</span>
                  <span>Le bénéficiaire devra renseigner son code lors de la réservation.</span>
                </li>
              </ul>
            </div>

            <div className="flex justify-between items-center px-1">
              <span className="text-lg font-bold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-blue-600">{productPrice ?? 0}€</span>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !selectedProduct || !productPrice}
              className="w-full h-12"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Ajout en cours…</div>
              ) : (
                <div className="flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Ajouter au panier</div>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) router.push('/reserver');
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">Bon cadeau ajouté !</DialogTitle>
            <DialogDescription className="text-center text-base">
              Votre bon cadeau a été ajouté avec succès à votre panier.
              <br />
              Que souhaitez-vous faire ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button
              onClick={() => { setShowSuccessDialog(false); router.push('/reserver'); }}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" /> Je continue mes achats
            </Button>
            <Button
              onClick={() => { setShowSuccessDialog(false); router.push('/checkout'); }}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4" /> Voir mon panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
