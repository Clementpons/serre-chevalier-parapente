import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Gift, User, Mail, MessageSquare, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { SessionManager } from '@/lib/sessionManager';
import { MdCardGiftcard } from 'react-icons/md';

interface GiftCardData {
  recipientName: string;
  recipientEmail?: string;
  notifyRecipient: boolean;
  personalMessage?: string;
}

interface GiftCardDetailsProps {
  participantData: GiftCardData;
  itemId: string;
  onUpdate: () => void;
}

export function GiftCardDetails({ 
  participantData, 
  itemId,
  onUpdate 
}: GiftCardDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notifyRecipient, setNotifyRecipient] = useState(participantData.notifyRecipient || false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      recipientName: participantData.recipientName,
      recipientEmail: participantData.recipientEmail || '',
      personalMessage: participantData.personalMessage || '',
    }
  });

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    
    try {
      const sessionId = SessionManager.getOrCreateSessionId();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items/${itemId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
            'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          },
          body: JSON.stringify({
            participantData: {
              recipientName: data.recipientName,
              recipientEmail: notifyRecipient ? data.recipientEmail : '',
              notifyRecipient: notifyRecipient,
              personalMessage: notifyRecipient ? data.personalMessage : '',
            }
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Modifications enregistrées",
          description: "Les informations de la carte cadeau ont été mises à jour",
        });
        setIsEditing(false);
        onUpdate();
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset({
      recipientName: participantData.recipientName,
      recipientEmail: participantData.recipientEmail || '',
      personalMessage: participantData.personalMessage || '',
    });
    setNotifyRecipient(participantData.notifyRecipient || false);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="bg-white border-green-200">
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                <Edit2 className="w-4 h-4" />
                Modifier les informations de la carte cadeau
              </h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-1" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="recipientName" className="text-xs">Nom du bénéficiaire *</Label>
                <Input
                  id="recipientName"
                  {...register('recipientName', { required: 'Nom du bénéficiaire requis' })}
                  className="h-9 text-sm"
                  placeholder="Jean Dupont"
                />
                {errors.recipientName && (
                  <p className="text-red-500 text-xs mt-1">{errors.recipientName.message}</p>
                )}
              </div>

              <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
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
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <Label htmlFor="notifyRecipient" className="cursor-pointer font-medium text-slate-700 text-xs">
                      Prévenir le bénéficiaire par email
                    </Label>
                    <p className="text-xs text-slate-600 mt-1">
                      {notifyRecipient
                        ? "Le bénéficiaire recevra un email avec sa carte cadeau"
                        : "Vous recevrez la carte cadeau et pourrez l'offrir vous-même"}
                    </p>
                  </div>
                </div>

                {notifyRecipient && (
                  <div className="space-y-3 pt-2 border-t border-slate-300">
                    <div>
                      <Label htmlFor="recipientEmail" className="text-xs">Email du bénéficiaire *</Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        {...register('recipientEmail', {
                          required: notifyRecipient ? 'Email requis' : false,
                        })}
                        className="h-9 text-sm mt-1"
                        placeholder="jean@exemple.com"
                      />
                      {errors.recipientEmail && (
                        <p className="text-red-500 text-xs mt-1">{errors.recipientEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="personalMessage" className="text-xs">Message personnalisé (optionnel)</Label>
                      <Textarea
                        id="personalMessage"
                        {...register('personalMessage')}
                        rows={3}
                        maxLength={500}
                        className="text-sm mt-1"
                        placeholder="Écrivez un message personnel..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum 500 caractères</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
            <MdCardGiftcard className="w-4 h-4" />
            Détails de la carte cadeau
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Modifier
          </Button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Bénéficiaire</p>
              <p className="font-medium text-slate-800">
                {participantData.recipientName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Notification email</p>
              <p className="font-medium text-slate-800">
                {(participantData.notifyRecipient || participantData.personalMessage) ? (
                  <>
                    <Badge variant="default" className="text-xs bg-green-600">
                      Activée
                    </Badge>
                    {participantData.recipientEmail && (
                      <span className="block text-xs text-slate-600 mt-1">
                        {participantData.recipientEmail}
                      </span>
                    )}
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Désactivée
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {participantData.personalMessage && (
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Message personnalisé</p>
                <p className="font-medium text-slate-700 text-xs mt-1 italic bg-white p-2 rounded border border-slate-200">
                  "{participantData.personalMessage}"
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}