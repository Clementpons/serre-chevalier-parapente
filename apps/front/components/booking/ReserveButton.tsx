'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReserveButtonProps {
  type: 'stage' | 'bapteme';
  stageType?: 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE';
  baptemeCategory?: 'AVENTURE' | 'DUREE' | 'LONGUE_DUREE' | 'ENFANT' | 'HIVER';
  className?: string;
}

export function ReserveButton({ type, stageType, baptemeCategory, className }: ReserveButtonProps) {
  const router = useRouter();

  const getButtonText = () => {
    if (type === 'stage') {
      switch (stageType) {
        case 'INITIATION':
          return 'Je réserve un stage initiation';
        case 'PROGRESSION':
          return 'Je réserve un stage progression';
        case 'AUTONOMIE':
          return 'Je réserve un stage autonomie';
        default:
          return 'Je réserve ce stage';
      }
    }
    
    if (type === 'bapteme' && baptemeCategory) {
      switch (baptemeCategory) {
        case 'AVENTURE':
          return 'Je réserve un baptême Aventure';
        case 'DUREE':
          return 'Je réserve un baptême Durée';
        case 'LONGUE_DUREE':
          return 'Je réserve un baptême Longue Durée';
        case 'ENFANT':
          return 'Je réserve un baptême Enfant';
        case 'HIVER':
          return 'Je réserve un baptême Hiver';
        default:
          return 'Je réserve un baptême';
      }
    }
    
    return 'Je réserve un baptême';
  };

  const handleReservation = () => {
    if (type === 'bapteme') {
      const params = new URLSearchParams();
      if (baptemeCategory) {
        params.set('category', baptemeCategory);
      }
      router.push(`/reserver/bapteme?${params.toString()}`);
    } else if (type === 'stage') {
      const params = new URLSearchParams();
      if (stageType) {
        params.set('stageType', stageType);
      }
      router.push(`/reserver/stage?${params.toString()}`);
    } else {
      router.push('/reserver');
    }
  };

  return (
    <Button
      onClick={handleReservation}
      className={className}
      size="lg"
    >
      <Calendar className="w-4 h-4 mr-2" />
      {getButtonText()}
    </Button>
  );
}