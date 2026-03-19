'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Gift, ShoppingCart, ArrowLeft, Plus, Loader2 } from 'lucide-react';
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

const GIFT_VOUCHER_PRODUCTS = [
  // STAGES
  {
    id: 'stage-initiation',
    productType: 'STAGE',
    category: 'INITIATION',
    label: 'Stage Initiation',
    description: 'Offrez un stage d\'initiation au parapente',
    duration: '5 jours',
  },
  {
    id: 'stage-progression',
    productType: 'STAGE',
    category: 'PROGRESSION',
    label: 'Stage Progression',
    description: 'Offrez un stage de progression au parapente',
    duration: '5 jours',
  },
  {
    id: 'stage-autonomie',
    productType: 'STAGE',
    category: 'AUTONOMIE',
    label: 'Stage Autonomie',
    description: 'Offrez un stage d\'autonomie au parapente',
    duration: '5 jours',
  },
  // BAPTEMES
  {
    id: 'bapteme-aventure',
    productType: 'BAPTEME',
    category: 'AVENTURE',
    label: 'Baptême Aventure',
    description: 'Vivez votre baptême aérien : liberté, frissons et vue imprenable',
    duration: '15 min',
  },
  {
    id: 'bapteme-duree',
    productType: 'BAPTEME',
    category: 'DUREE',
    label: 'Baptême Durée',
    description: 'Plus long, plus haut, plus fort. Adrénaline garantie',
    duration: '30 min',
  },
  {
    id: 'bapteme-longue-duree',
    productType: 'BAPTEME',
    category: 'LONGUE_DUREE',
    label: 'Baptême Longue Durée',
    description: 'Plus on reste dans le ciel, plus le plaisir grandit',
    duration: '45 min',
  },
  {
    id: 'bapteme-enfant',
    productType: 'BAPTEME',
    category: 'ENFANT',
    label: 'Baptême Enfant',
    description: 'Pour les p\'tits loups dans l\'aventure et la montagne',
    duration: '10 min',
  },
  {
    id: 'bapteme-hiver',
    productType: 'BAPTEME',
    category: 'HIVER',
    label: 'Baptême Hiver',
    description: 'Les sommets enneigés à perte de vue, en toute liberté',
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

export default function BonCadeauReservationClientPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifyRecipient, setNotifyRecipient] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<GiftVoucherFormData>();
  const { toast } = useToast();

  // Charger le prix quand un produit est sélectionné
  useEffect(() => {
    if (selectedProduct) {
      loadProductPrice();
    }
  }, [selectedProduct]);

  const loadProductPrice = async () => {
    const product = GIFT_VOUCHER_PRODUCTS.find(p => p.id === selectedProduct);
    if (!product) return;

    setLoadingPrice(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/giftvouchers/price/${product.productType}/${product.category}`,
        {
          headers: {
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setProductPrice(data.data.price);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le prix",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur chargement prix:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du prix",
        variant: "destructive",
      });
    } finally {
      setLoadingPrice(false);
    }
  };

  const onSubmit = async (data: GiftVoucherFormData) => {
    if (!selectedProduct || !productPrice) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un produit",
        variant: "destructive",
      });
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
            // Champs requis par le backend (même pour GIFT_VOUCHER)
            firstName: data.buyerName.split(' ')[0] || data.buyerName,
            lastName: data.buyerName.split(' ').slice(1).join(' ') || '',
            email: data.buyerEmail,
            phone: '',
            weight: 0,
            height: 0,
            // Champs spécifiques au bon cadeau
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
        toast({
          title: "Erreur",
          description: result.message || 'Erreur lors de l\'ajout du bon cadeau',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur ajout bon cadeau:', error);
      toast({
        title: "Erreur",
        description: 'Erreur lors de l\'ajout du bon cadeau',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 pt-12">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/reserver">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">
              Offrir un Bon Cadeau
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <Gift className="w-16 h-16 mx-auto mb-4 text-cyan-600" />
          <h2 className="text-3xl font-bold mb-2">Offrir un Bon Cadeau</h2>
          <p className="text-gray-600">Offrez à vos proches une place complète dans un stage ou baptême !</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Sélection du produit */}
          <Card>
            <CardHeader>
              <CardTitle>Choisissez le produit à offrir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GIFT_VOUCHER_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProduct === product.id
                        ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{product.label}</h3>
                        <Badge variant="outline" className="mt-1">
                          {product.duration}
                        </Badge>
                      </div>
                      {selectedProduct === product.id && (
                        <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                ))}
              </div>

              {/* Affichage du prix */}
              {selectedProduct && (
                <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-cyan-700 font-medium">Prix du bon cadeau</p>
                      <p className="text-xs text-cyan-600 mt-1">
                        Le bénéficiaire pourra réserver gratuitement une place pour ce produit
                      </p>
                    </div>
                    <div className="text-right">
                      {loadingPrice ? (
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                      ) : (
                        <p className="text-2xl font-bold text-cyan-600">{productPrice}€</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations bénéficiaire */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du bénéficiaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipientName">Nom du bénéficiaire *</Label>
                  <Input
                    id="recipientName"
                    {...register('recipientName', { required: 'Nom requis' })}
                    placeholder="Jean Dupont"
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
                          message: 'Email invalide'
                        } : undefined
                      })}
                      placeholder="jean@exemple.com"
                    />
                    {errors.recipientEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.recipientEmail.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Case à cocher pour prévenir le bénéficiaire */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-start space-x-3">
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
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div className="flex-1">
                    <Label htmlFor="notifyRecipient" className="cursor-pointer font-medium text-slate-700">
                      Je souhaite prévenir le bénéficiaire par email
                    </Label>
                    <p className="text-sm text-slate-600 mt-1">
                      {notifyRecipient
                        ? "Le bénéficiaire recevra un email avec son bon cadeau"
                        : "Vous recevrez le bon cadeau et pourrez l'offrir vous-même"}
                    </p>
                  </div>
                </div>

                {/* Message personnalisé */}
                {notifyRecipient && (
                  <div className="pt-2 border-t border-slate-300">
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
                    <p className="text-xs text-gray-500 mt-1">Maximum 2000 caractères</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informations acheteur */}
          <Card>
            <CardHeader>
              <CardTitle>Vos informations</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName">Votre nom *</Label>
                <Input
                  id="buyerName"
                  {...register('buyerName', { required: 'Nom requis' })}
                  placeholder="Marie Martin"
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
                />
                {errors.buyerEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.buyerEmail.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Récapitulatif et validation */}
          <Card>
            <CardContent className="pt-6">
              {/* Informations importantes */}
              <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                <h3 className="font-semibold text-cyan-900 mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Informations importantes
                </h3>
                <ul className="space-y-2 text-sm text-cyan-800">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-0.5">•</span>
                    <span>Le bon cadeau sera <strong>valable un an</strong> à compter de la date d'achat.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-0.5">•</span>
                    <span>Le bon cadeau couvre <strong>100% du prix</strong> d'une place pour le produit sélectionné.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-600 mt-0.5">•</span>
                    <span>Le bénéficiaire devra renseigner son code lors de la réservation.</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg">Total à payer :</span>
                <span className="text-2xl font-bold text-cyan-600">
                  {productPrice || 0}€
                </span>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !selectedProduct || !productPrice}
                className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Ajouter au panier
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Dialog de confirmation */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) {
            router.push('/reserver');
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Bon cadeau ajouté !
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Votre bon cadeau a été ajouté avec succès à votre panier.
              <br />
              Que souhaitez-vous faire ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/reserver');
              }}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Je continue mes achats
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/checkout');
              }}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Voir mon panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}