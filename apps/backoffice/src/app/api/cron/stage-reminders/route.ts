import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendStageReminderEmail } from "@/lib/resend";

// Protège la route : Vercel injecte automatiquement Authorization: Bearer $CRON_SECRET
function isAuthorized(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

function startOfDayUTC(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDaysUTC(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = startOfDayUTC(new Date());
  const tomorrow = addDaysUTC(today, 1);
  const dayAfterTomorrow = addDaysUTC(today, 2);
  const in7Days = addDaysUTC(today, 7);
  const in8Days = addDaysUTC(today, 8);

  // Récupère uniquement les stages commençant demain OU dans exactement 7 jours
  const allStages = await prisma.stage.findMany({
    where: {
      OR: [
        { startDate: { gte: tomorrow, lt: dayAfterTomorrow } },
        { startDate: { gte: in7Days, lt: in8Days } },
      ],
    },
    include: {
      bookings: {
        include: {
          stagiaire: true,
          orderItem: {
            include: {
              order: true,
            },
          },
        },
      },
    },
  });

  const stagesTomorrow = allStages.filter(
    (s) => s.startDate >= tomorrow && s.startDate < dayAfterTomorrow,
  );
  const stagesIn7Days = allStages.filter(
    (s) => s.startDate >= in7Days && s.startDate < in8Days,
  );

  const results: { sent: number; skipped: number; errors: string[] } = {
    sent: 0,
    skipped: 0,
    errors: [],
  };

  async function processBookings(
    stageList: typeof allStages,
    daysUntilStart: 1 | 7,
  ) {
    for (const stage of stageList) {
      for (const booking of stage.bookings) {
        // On n'envoie que si la commande est payée (statut PAID ou FULLY_PAID ou CONFIRMED)
        const orderStatus = booking.orderItem?.order?.status;
        const isPaid = ["PAID", "FULLY_PAID", "CONFIRMED"].includes(
          orderStatus ?? "",
        );

        if (!isPaid) {
          results.skipped++;
          continue;
        }

        try {
          await sendStageReminderEmail({
            firstName: booking.stagiaire.firstName,
            lastName: booking.stagiaire.lastName,
            email: booking.stagiaire.email,
            stageType: stage.type,
            startDate: stage.startDate.toISOString(),
            daysUntilStart,
            bookingShortCode: booking.shortCode,
            remainingAmount:
              booking.orderItem?.effectiveRemainingAmount ??
              booking.orderItem?.remainingAmount ??
              undefined,
          });
          results.sent++;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          results.errors.push(
            `${booking.stagiaire.email} (${booking.id}): ${msg}`,
          );
        }
      }
    }
  }

  await processBookings(stagesTomorrow, 1);
  await processBookings(stagesIn7Days, 7);

  console.log("[cron/stage-reminders]", results);

  return NextResponse.json({ success: true, ...results });
}
