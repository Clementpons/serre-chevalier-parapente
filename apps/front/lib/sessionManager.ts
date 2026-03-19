import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private static readonly SESSION_KEY = 'cart-session-id';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h en ms

  static getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return uuidv4();
    }

    let sessionId = localStorage.getItem(this.SESSION_KEY);

    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(this.SESSION_KEY, sessionId);
      this.scheduleSessionCleanup(sessionId);
    }

    return sessionId;
  }

  static hasActiveSession(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(this.SESSION_KEY);
  }

  static clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('cart-items-cache');
    localStorage.removeItem('participant-draft');
  }

  private static scheduleSessionCleanup(sessionId: string): void {
    setTimeout(() => {
      const currentSessionId = localStorage.getItem(this.SESSION_KEY);
      if (currentSessionId === sessionId) {
        this.clearSession();
      }
    }, this.SESSION_DURATION);
  }
}
