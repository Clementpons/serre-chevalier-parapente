'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReservationStatusBadgeProps {
  expiresAt: string;
  variant?: 'compact' | 'full';
}

export function ReservationStatusBadge({ expiresAt, variant = 'compact' }: ReservationStatusBadgeProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(expiresAt).getTime();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining(0);
      } else {
        setIsExpired(false);
        setTimeRemaining(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timeRemaining === null) return null;

  const isUrgent = timeRemaining < 300000; // Moins de 5 minutes

  if (variant === 'compact') {
    return (
      <Badge 
        variant={isExpired ? "destructive" : isUrgent ? "default" : "secondary"}
        className={`text-xs ${
          isExpired ? 'bg-red-600' : 
          isUrgent ? 'bg-orange-600 hover:bg-orange-700' : 
          'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <Clock className="w-3 h-3 mr-1" />
        {isExpired ? 'Expiré' : formatTimeRemaining(timeRemaining)}
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      isExpired ? 'bg-red-50 border-red-200' :
      isUrgent ? 'bg-orange-50 border-orange-200' :
      'bg-blue-50 border-blue-200'
    }`}>
      {isExpired ? (
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 animate-pulse" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${
          isExpired ? 'text-red-800' :
          isUrgent ? 'text-orange-800' :
          'text-blue-800'
        }`}>
          {isExpired ? 'Place expirée' : 'Place bloquée'}
        </p>
        <p className={`text-xs ${
          isExpired ? 'text-red-600' :
          isUrgent ? 'text-orange-600' :
          'text-blue-600'
        }`}>
          {isExpired ? 'Cette place a été libérée' : `Expire dans ${formatTimeRemaining(timeRemaining)}`}
        </p>
      </div>
    </div>
  );
}