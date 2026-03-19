'use client';

import { useState, useEffect, useCallback } from 'react';

interface AvailabilityData {
  available: boolean;
  availablePlaces: number;
  totalPlaces: number;
  confirmedBookings: number;
  temporaryReservations: number;
  reason?: string;
}

export function useAvailability(type: 'stage' | 'bapteme', itemId: string) {
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/check`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: JSON.stringify({ type, itemId }),
      });

      const data = await response.json();

      if (data.success) {
        setAvailability(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la vérification des disponibilités');
    } finally {
      setLoading(false);
    }
  }, [type, itemId]);

  useEffect(() => {
    if (itemId) {
      checkAvailability();
      
      // Vérifier toutes les 30 secondes
      const interval = setInterval(checkAvailability, 30000);
      
      return () => clearInterval(interval);
    }
  }, [checkAvailability, itemId]);

  return {
    availability,
    loading,
    error,
    refresh: checkAvailability,
  };
}