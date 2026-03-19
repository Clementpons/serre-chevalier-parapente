import prisma from "@/lib/prisma";
import {
  AudienceRuleType,
  BaptemeCategory,
  StageBookingType,
} from "@prisma/client";

export interface ResolvedContact {
  name: string;
  phone: string;
  email?: string;
}

export interface AudienceRuleConfig {
  ruleType: AudienceRuleType;
  stageType?: StageBookingType | null;
  baptemeCategory?: BaptemeCategory | null;
  minOrderAmount?: number | null;
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

/**
 * Résout les règles d'une audience et retourne les contacts uniques dédupliqués par téléphone.
 * Mutualisé pour être utilisé à la fois par l'API des audiences et l'API d'envoi SMS.
 */
export async function resolveAudience(
  rules: AudienceRuleConfig[],
): Promise<ResolvedContact[]> {
  const contactMap = new Map<string, ResolvedContact>();

  const addContact = (phone: string, name: string, email?: string | null) => {
    const normalizedPhone = phone.replace(/\s/g, "").trim();
    if (normalizedPhone && !contactMap.has(normalizedPhone)) {
      contactMap.set(normalizedPhone, {
        name,
        phone: normalizedPhone,
        email: email ?? undefined,
      });
    }
  };

  for (const rule of rules) {
    const dateFilter =
      rule.dateFrom || rule.dateTo
        ? { gte: rule.dateFrom ?? undefined, lte: rule.dateTo ?? undefined }
        : undefined;

    switch (rule.ruleType) {
      case "CLIENT_RESERVED_STAGE": {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: dateFilter,
            orderItems: {
              some: {
                type: "STAGE",
                ...(rule.stageType && {
                  stage: { is: { type: rule.stageType } },
                }),
              },
            },
          },
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        });
        for (const o of orders) {
          if (o.client?.phone)
            addContact(
              o.client.phone,
              `${o.client.firstName} ${o.client.lastName}`,
              o.client.email,
            );
        }
        break;
      }
      case "CLIENT_RESERVED_BAPTEME": {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: dateFilter,
            orderItems: {
              some: {
                type: "BAPTEME",
                ...(rule.baptemeCategory && {
                  bapteme: {
                    is: { categories: { has: rule.baptemeCategory } },
                  },
                }),
              },
            },
          },
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        });
        for (const o of orders) {
          if (o.client?.phone)
            addContact(
              o.client.phone,
              `${o.client.firstName} ${o.client.lastName}`,
              o.client.email,
            );
        }
        break;
      }
      case "STAGIAIRE_STAGE": {
        const stagiaires = await prisma.stagiaire.findMany({
          where: {
            stageBookings: {
              some: {
                stage: {
                  ...(rule.stageType && { type: rule.stageType }),
                  ...(dateFilter && { startDate: dateFilter }),
                },
              },
            },
          },
          select: { firstName: true, lastName: true, phone: true, email: true },
        });
        for (const s of stagiaires) {
          if (s.phone)
            addContact(s.phone, `${s.firstName} ${s.lastName}`, s.email);
        }
        break;
      }
      case "STAGIAIRE_BAPTEME": {
        const stagiaires = await prisma.stagiaire.findMany({
          where: {
            baptemeBookings: {
              some: {
                bapteme: {
                  ...(rule.baptemeCategory && {
                    category: rule.baptemeCategory,
                  }),
                  ...(dateFilter && { date: dateFilter }),
                },
              },
            },
          },
          select: { firstName: true, lastName: true, phone: true, email: true },
        });
        for (const s of stagiaires) {
          if (s.phone)
            addContact(s.phone, `${s.firstName} ${s.lastName}`, s.email);
        }
        break;
      }
      case "PURCHASED_GIFT_VOUCHER": {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: dateFilter,
            orderItems: { some: { type: "GIFT_VOUCHER" } },
          },
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        });
        for (const o of orders) {
          if (o.client?.phone)
            addContact(
              o.client.phone,
              `${o.client.firstName} ${o.client.lastName}`,
              o.client.email,
            );
        }
        break;
      }
      case "ORDER_ABOVE_AMOUNT": {
        const orders = await prisma.order.findMany({
          where: {
            createdAt: dateFilter,
            totalAmount: { gte: rule.minOrderAmount ?? 0 },
          },
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        });
        for (const o of orders) {
          if (o.client?.phone)
            addContact(
              o.client.phone,
              `${o.client.firstName} ${o.client.lastName}`,
              o.client.email,
            );
        }
        break;
      }
    }
  }

  return Array.from(contactMap.values());
}
