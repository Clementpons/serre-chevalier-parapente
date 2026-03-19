'use client';

import { useAvailability } from '@/hooks/useAvailability';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertTriangle } from 'lucide-react';

interface AvailabilityIndicatorProps {
  type: 'stage' | 'bapteme';
  itemId: string;
  showDetails?: boolean;
}

export function AvailabilityIndicator({ 
  type, 
  itemId, 
  showDetails = false 
}: AvailabilityIndicatorProps) {
  const { availability, loading, error } = useAvailability(type, itemId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4 animate-spin" />
        Vérification...
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertTriangle className="w-4 h-4" />
        Erreur de vérification
      </div>
    );
  }

  const getStatusColor = () => {
    if (!availability.available) return 'destructive';
    if (availability.availablePlaces <= 2) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (!availability.available) return 'Complet';
    if (availability.availablePlaces === 1) return '1 place restante';
    return `${availability.availablePlaces} places disponibles`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <Badge variant={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>

      {showDetails && availability.available && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>Total: {availability.totalPlaces} places</div>
          <div>Confirmées: {availability.confirmedBookings}</div>
          {availability.temporaryReservations > 0 && (
            <div>En cours de réservation: {availability.temporaryReservations}</div>
          )}
        </div>
      )}

      {!availability.available && availability.reason && (
        <div className="text-xs text-red-500">
          {availability.reason}
        </div>
      )}
    </div>
  );
}