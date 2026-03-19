'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { ParticipantFormModal } from './ParticipantFormModal';

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  type: string;
}

interface Bapteme {
  id: string;
  date: string;
  duration: number;
  places: number;
  categories: string[];
}

interface AddToCartButtonProps {
  type: 'stage' | 'bapteme';
  item: Stage | Bapteme;
  className?: string;
}

export function AddToCartButton({ type, item, className }: AddToCartButtonProps) {
  const [showParticipantForm, setShowParticipantForm] = useState(false);

  return (
    <>
      {/* Bouton principal - simple et direct */}
      <Button
        onClick={() => setShowParticipantForm(true)}
        className={className}
        size="lg"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        {type === 'stage' ? 'Réserver ce stage' : 'Réserver ce baptême'}
      </Button>

      {/* Modal formulaire participant */}
      {showParticipantForm && (
        <ParticipantFormModal
          type={type}
          item={item}
          onClose={() => setShowParticipantForm(false)}
          onSuccess={() => {
            setShowParticipantForm(false);
            // Toast de succès sera géré dans le modal
          }}
        />
      )}
    </>
  );
}