import "server-only";
import prisma from "./prisma";

export class AvailabilityService {
  
  /**
   * Vérifier les disponibilités en temps réel
   */
  static async checkAvailability(
    type: 'stage' | 'bapteme',
    itemId: string,
    requestedQuantity: number = 1
  ) {
    const now = new Date();
    
    // Nettoyer les items expirés pour cet item spécifique avant de vérifier les disponibilités
    const whereExpired: any = {
      expiresAt: { lte: now },
      isExpired: false,
    };
    
    if (type === 'stage') {
      whereExpired.type = 'STAGE';
      whereExpired.stageId = itemId;
    } else if (type === 'bapteme') {
      whereExpired.type = 'BAPTEME';
      whereExpired.baptemeId = itemId;
    }
    
    // Supprimer les items expirés
    const deletedCount = await prisma.cartItem.deleteMany({
      where: whereExpired,
    });
    
    if (type === 'stage') {
      const stage = await prisma.stage.findUnique({
        where: { id: itemId },
        include: {
          bookings: true,
        }
      });

      if (!stage) return { available: false, reason: 'Stage introuvable' };

      const confirmedBookings = stage.bookings.length;
      
      // Compter les réservations temporaires (items dans les paniers non expirés)
      const temporaryCartItems = await prisma.cartItem.count({
        where: {
          type: 'STAGE',
          stageId: itemId,
          expiresAt: { gt: now },
          isExpired: false,
        }
      });
      
      const totalReserved = confirmedBookings + temporaryCartItems;
      const availablePlaces = stage.places - totalReserved;

      return {
        available: availablePlaces >= requestedQuantity,
        availablePlaces,
        totalPlaces: stage.places,
        confirmedBookings,
        temporaryReservations: temporaryCartItems,
        reason: availablePlaces < requestedQuantity ? 'Places insuffisantes' : null
      };
    }

    if (type === 'bapteme') {
      const bapteme = await prisma.bapteme.findUnique({
        where: { id: itemId },
        include: {
          bookings: true,
        }
      });

      if (!bapteme) return { available: false, reason: 'Baptême introuvable' };

      const confirmedBookings = bapteme.bookings.length;
      
      // Compter les réservations temporaires (items dans les paniers non expirés)
      const temporaryCartItems = await prisma.cartItem.count({
        where: {
          type: 'BAPTEME',
          baptemeId: itemId,
          expiresAt: { gt: now },
          isExpired: false,
        }
      });
      
      const totalReserved = confirmedBookings + temporaryCartItems;
      const availablePlaces = bapteme.places - totalReserved;

      return {
        available: availablePlaces >= requestedQuantity,
        availablePlaces,
        totalPlaces: bapteme.places,
        confirmedBookings,
        temporaryReservations: temporaryCartItems,
        reason: availablePlaces < requestedQuantity ? 'Places insuffisantes' : null
      };
    }

    return { available: false, reason: 'Type invalide' };
  }

  /**
   * Créer une réservation temporaire
   */
  static async createTemporaryReservation(
    sessionId: string,
    type: 'stage' | 'bapteme',
    itemId: string,
    quantity: number = 1,
    durationMinutes: number = 15
  ) {
    // Vérifier disponibilité
    const availability = await this.checkAvailability(type, itemId, quantity);
    
    if (!availability.available) {
      throw new Error(availability.reason || 'Places non disponibles');
    }

    // Supprimer les anciennes réservations de cette session pour cet item
    await this.releaseTemporaryReservation(sessionId, type, itemId);

    // Créer nouvelle réservation temporaire
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

    const data: any = {
      sessionId,
      quantity,
      expiresAt,
    };

    if (type === 'stage') {
      data.stageId = itemId;
    } else {
      data.baptemeId = itemId;
    }

    const reservation = await prisma.temporaryReservation.create({
      data,
    });

    return {
      success: true,
      reservation,
      expiresAt,
    };
  }

  /**
   * Libérer une réservation temporaire
   */
  static async releaseTemporaryReservation(
    sessionId: string,
    type?: 'stage' | 'bapteme',
    itemId?: string
  ) {
    const where: any = { sessionId };
    
    if (type && itemId) {
      if (type === 'stage') {
        where.stageId = itemId;
      } else {
        where.baptemeId = itemId;
      }
    }

    await prisma.temporaryReservation.deleteMany({
      where,
    });
  }

  /**
   * Nettoyer les réservations expirées
   */
  static async cleanupExpiredReservations() {
    const now = new Date();
    
    const result = await prisma.temporaryReservation.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });

    return result.count;
  }

  /**
   * Prolonger une réservation temporaire
   */
  static async extendTemporaryReservation(
    sessionId: string,
    type: 'stage' | 'bapteme',
    itemId: string,
    additionalMinutes: number = 15
  ) {
    const where: any = { sessionId };
    
    if (type === 'stage') {
      where.stageId = itemId;
    } else {
      where.baptemeId = itemId;
    }

    const reservation = await prisma.temporaryReservation.findFirst({
      where,
    });

    if (!reservation) {
      throw new Error('Réservation temporaire introuvable');
    }

    const newExpiresAt = new Date(reservation.expiresAt);
    newExpiresAt.setMinutes(newExpiresAt.getMinutes() + additionalMinutes);

    await prisma.temporaryReservation.update({
      where: { id: reservation.id },
      data: { expiresAt: newExpiresAt },
    });

    return newExpiresAt;
  }

  /**
   * Récupérer les années et mois disponibles avec le nombre de créneaux
   */
  static async getAvailablePeriodsWithCounts(
    type: 'stage' | 'bapteme',
    category?: string,
    stageType?: 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE'
  ): Promise<{
    years: { year: number; count: number }[];
    monthsByYear: Record<number, { month: number; count: number }[]>;
  }> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const maxYear = currentYear + 2; // Limiter à 2 ans dans le futur

    if (type === 'stage') {
      const whereClause: any = {
        startDate: {
          gte: now,
          lte: new Date(maxYear, 11, 31, 23, 59, 59),
        },
      };

      if (stageType) {
        // Si on recherche INITIATION ou PROGRESSION, inclure aussi les stages DOUBLE
        // car DOUBLE = INITIATION + PROGRESSION
        if (stageType === 'INITIATION' || stageType === 'PROGRESSION') {
          whereClause.type = {
            in: [stageType, 'DOUBLE']
          };
        } else {
          // Pour AUTONOMIE, rechercher uniquement ce type
          whereClause.type = stageType;
        }
      }

      const stages = await prisma.stage.findMany({
        where: whereClause,
        select: {
          startDate: true,
        },
      });

      return this.processPeriodsWithCounts(stages.map(s => s.startDate));
    }

    if (type === 'bapteme') {
      // D'abord récupérer tous les baptêmes futurs
      const allBaptemes = await prisma.bapteme.findMany({
        where: {
          date: {
            gte: now,
            lte: new Date(maxYear, 11, 31, 23, 59, 59),
          },
        },
        select: {
          date: true,
          categories: true,
        },
      });

      // Filtrer côté application si une catégorie est spécifiée
      let filteredBaptemes = allBaptemes;
      if (category) {
        filteredBaptemes = allBaptemes.filter(bapteme =>
          bapteme.categories.includes(category as any)
        );
      }

      return this.processPeriodsWithCounts(filteredBaptemes.map(b => b.date));
    }

    return { years: [], monthsByYear: {} };
  }

  /**
   * Traiter les dates pour extraire les années et mois avec compteurs
   */
  private static processPeriodsWithCounts(dates: Date[]): {
    years: { year: number; count: number }[];
    monthsByYear: Record<number, { month: number; count: number }[]>;
  } {
    const yearCounts = new Map<number, number>();
    const monthCounts = new Map<string, number>(); // key: "year-month"

    dates.forEach(date => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // +1 car getMonth() retourne 0-11
      const key = `${year}-${month}`;

      // Compter les années
      yearCounts.set(year, (yearCounts.get(year) || 0) + 1);
      
      // Compter les mois par année
      monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    });

    // Convertir en format de sortie
    const years = Array.from(yearCounts.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);

    const monthsByYear: Record<number, { month: number; count: number }[]> = {};
    
    monthCounts.forEach((count, key) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      
      if (!monthsByYear[year]) {
        monthsByYear[year] = [];
      }
      
      monthsByYear[year].push({ month, count });
    });

    // Trier les mois pour chaque année
    Object.keys(monthsByYear).forEach(yearKey => {
      const year = parseInt(yearKey);
      monthsByYear[year].sort((a, b) => a.month - b.month);
    });

    return { years, monthsByYear };
  }

  /**
   * Récupérer les mois disponibles pour une année donnée (méthode legacy)
   */
  static async getAvailableMonths(
    type: 'stage' | 'bapteme',
    year: number,
    category?: string,
    stageType?: 'INITIATION' | 'PROGRESSION' | 'AUTONOMIE'
  ): Promise<number[]> {
    const periods = await this.getAvailablePeriodsWithCounts(type, category, stageType);
    return periods.monthsByYear[year]?.map(m => m.month) || [];
  }
}