import { useState } from 'react';
import { Video, Check, X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { SessionManager } from '@/lib/sessionManager';
import { useBaptemePrices } from '@/hooks/useBaptemePrices';

interface VideoToggleProps {
  itemId: string;
  hasVideo: boolean;
  onUpdate: () => void;
  participantData: any;
}

export function VideoToggle({ itemId, hasVideo, onUpdate, participantData }: VideoToggleProps) {
  const { videoOptionPrice, loading: pricesLoading } = useBaptemePrices();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const toggleVideo = async () => {
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
              ...participantData,
              hasVideo: !hasVideo,
            }
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: hasVideo ? "Option vidéo retirée" : "Option vidéo ajoutée",
          description: hasVideo
            ? `L'option vidéo a été retirée (-${videoOptionPrice}€)`
            : `L'option vidéo a été ajoutée (+${videoOptionPrice}€)`,
        });
        // Appeler onUpdate pour rafraîchir silencieusement
        onUpdate();
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de la mise à jour",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur mise à jour vidéo:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4 text-slate-600" />
        <div>
          <p className="text-sm font-medium text-slate-800">Option vidéo souvenir</p>
          <p className="text-xs text-slate-500">
            Immortalisez votre vol ({pricesLoading ? (
              <span className="inline-block w-6 h-3 bg-slate-200 animate-pulse rounded align-middle" />
            ) : `+${videoOptionPrice}€`})
          </p>
        </div>
      </div>
      
      <Button
        variant={hasVideo ? "default" : "outline"}
        size="sm"
        onClick={toggleVideo}
        disabled={isSaving}
        className={`min-w-[120px] ${
          hasVideo 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'border bg-transparent border-gray-400 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            <span className="text-xs">Mise à jour...</span>
          </>
        ) : hasVideo ? (
          <>
            <Check className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Incluse</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            <span className="text-xs font-semibold">Ajouter</span>
          </>
        )}
      </Button>
    </div>
  );
}