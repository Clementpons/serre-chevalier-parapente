'use client';

import { useState, useEffect, useCallback } from 'react';
import { SessionManager } from '@/lib/sessionManager';

interface SessionInfo {
  sessionId: string;
  itemCount: number;
  expiresAt: Date;
  isExpired: boolean;
}

export function useSession() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const info = await SessionManager.getSessionInfo();
      
      if (info) {
        const expiresAt = new Date(info.expiresAt);
        const isExpired = expiresAt <= new Date();
        
        setSessionInfo({
          ...info,
          expiresAt,
          isExpired,
        });

        // Si expiré, nettoyer
        if (isExpired) {
          SessionManager.clearSession();
        }
      } else {
        setSessionInfo(null);
      }
    } catch (error) {
      console.error('Erreur refresh session:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
    
    // Vérifier toutes les minutes
    const interval = setInterval(refreshSession, 60000);
    
    return () => clearInterval(interval);
  }, [refreshSession]);

  const clearSession = useCallback(() => {
    SessionManager.clearSession();
    setSessionInfo(null);
  }, []);

  const migrateToUser = useCallback(async (userId: string) => {
    const success = await SessionManager.migrateCartToUser(userId);
    if (success) {
      setSessionInfo(null);
    }
    return success;
  }, []);

  return {
    sessionInfo,
    loading,
    refreshSession,
    clearSession,
    migrateToUser,
    hasActiveSession: SessionManager.hasActiveSession(),
    sessionId: SessionManager.getOrCreateSessionId(),
  };
}