import { Hono } from "hono";
import { requireMonitor } from "@/lib/middlewares";
import prisma from "@/lib/prisma";

const app = new Hono()
  // GET dashboard statistics
  .get("/stats", requireMonitor, async (c) => {
    try {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );
      const currentYearStart = new Date(now.getFullYear(), 0, 1);

      // Calculate the start date for 13 months ago
      const thirteenMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 12,
        1
      );

      // Fetch revenue data for current month (online vs total)
      const [
        onlineRevenueThisMonth,
        manualRevenueThisMonth,
        totalRevenueThisYear,
      ] = await Promise.all([
        // Online revenue (Stripe payments only) for current month
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: false,
            paymentType: { not: "GIFT_VOUCHER" },
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),

        // Manual revenue (manual payments only) for current month
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            isManual: true,
            paymentType: { not: "GIFT_VOUCHER" },
            createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
          },
          _sum: { amount: true },
        }),

        // Total revenue for current year
        prisma.payment.aggregate({
          where: {
            status: "SUCCEEDED",
            paymentType: { not: "GIFT_VOUCHER" },
            createdAt: { gte: currentYearStart },
          },
          _sum: { amount: true },
        }),
      ]);

      const onlineRevenue = onlineRevenueThisMonth._sum.amount || 0;
      const manualRevenue = manualRevenueThisMonth._sum.amount || 0;
      const totalRevenueMonth = onlineRevenue + manualRevenue;
      const totalRevenueYear = totalRevenueThisYear._sum.amount || 0;

      const user = await prisma.user.findUnique({
        where: { id: c.get("userId") },
        select: { role: true },
      });

      // KPIs — admin only
      let kpis = null;
      if (user?.role === "ADMIN") {
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [
          upcomingStages,
          upcomingBaptemes,
          activeStageBookings,
          activeBaptemeBookings,
          totalStagiaires,
          pendingBalanceAgg,
          recentStageBookings,
          recentBaptemeBookings,
        ] = await Promise.all([
          prisma.stage.count({ where: { startDate: { gte: now, lte: thirtyDaysFromNow } } }),
          prisma.bapteme.count({ where: { date: { gte: now, lte: thirtyDaysFromNow } } }),
          prisma.stageBooking.count(),
          prisma.baptemeBooking.count(),
          prisma.stagiaire.count(),
          prisma.orderItem.aggregate({
            where: { isFullyPaid: false, remainingAmount: { gt: 0 } },
            _sum: { remainingAmount: true },
          }),
          prisma.stageBooking.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
          prisma.baptemeBooking.count({ where: { createdAt: { gte: twentyFourHoursAgo } } }),
        ]);

        kpis = {
          upcomingStages,
          upcomingBaptemes,
          activeReservations: activeStageBookings + activeBaptemeBookings,
          totalStagiaires,
          pendingBalance: pendingBalanceAgg._sum.remainingAmount || 0,
          recentReservations: recentStageBookings + recentBaptemeBookings,
        };
      }

      // Admin-only extended stats
      let chart = null;
      let thisMonth = null;
      let prevMonth = null;
      let reservations = null;

      if (user?.role === "ADMIN") {
        // Stacked monthly revenue: total, online, manual, stages, baptemes, giftVouchers
        const stackedMonthlyRaw = await prisma.$queryRaw<
          Array<{
            month: Date;
            is_manual: boolean;
            item_type: string | null;
            total: number;
          }>
        >`
          SELECT
            DATE_TRUNC('month', p."createdAt") AS month,
            p."isManual" AS is_manual,
            oi."type" AS item_type,
            COALESCE(SUM(pa."allocatedAmount"), 0)::float AS total
          FROM "Payment" p
          LEFT JOIN "PaymentAllocation" pa ON pa."paymentId" = p.id
          LEFT JOIN "OrderItem" oi ON oi.id = pa."orderItemId"
          WHERE p.status = 'SUCCEEDED'
            AND p."paymentType" != 'GIFT_VOUCHER'
            AND p."createdAt" >= ${thirteenMonthsAgo}
          GROUP BY DATE_TRUNC('month', p."createdAt"), p."isManual", oi."type"
          ORDER BY month ASC
        `;

        // Also get totals (without allocation breakdown) for payments that may not have allocations
        const totalMonthlyRaw = await prisma.$queryRaw<
          Array<{
            month: Date;
            is_manual: boolean;
            total: number;
          }>
        >`
          SELECT
            DATE_TRUNC('month', "createdAt") AS month,
            "isManual" AS is_manual,
            COALESCE(SUM(amount), 0)::float AS total
          FROM "Payment"
          WHERE status = 'SUCCEEDED'
            AND "paymentType" != 'GIFT_VOUCHER'
            AND "createdAt" >= ${thirteenMonthsAgo}
          GROUP BY DATE_TRUNC('month', "createdAt"), "isManual"
          ORDER BY month ASC
        `;

        const byMonth = [];
        for (let i = 12; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${monthDate.getFullYear()}-${String(
            monthDate.getMonth() + 1
          ).padStart(2, "0")}`;

          const matchMonth = (item: { month: Date }) => {
            const d = new Date(item.month);
            return (
              d.getFullYear() === monthDate.getFullYear() &&
              d.getMonth() === monthDate.getMonth()
            );
          };

          // Sum online and manual totals from the total query
          const onlineTotal = totalMonthlyRaw
            .filter((r) => matchMonth(r) && !r.is_manual)
            .reduce((s, r) => s + Number(r.total), 0);
          const manualTotal = totalMonthlyRaw
            .filter((r) => matchMonth(r) && r.is_manual)
            .reduce((s, r) => s + Number(r.total), 0);

          // Sum by item type from the stacked query
          const stagesTotal = stackedMonthlyRaw
            .filter((r) => matchMonth(r) && r.item_type === "STAGE")
            .reduce((s, r) => s + Number(r.total), 0);
          const baptemesTotal = stackedMonthlyRaw
            .filter((r) => matchMonth(r) && r.item_type === "BAPTEME")
            .reduce((s, r) => s + Number(r.total), 0);
          const giftVouchersTotal = stackedMonthlyRaw
            .filter((r) => matchMonth(r) && r.item_type === "GIFT_VOUCHER")
            .reduce((s, r) => s + Number(r.total), 0);

          const monthLabelStr = monthDate.toLocaleDateString("fr-FR", {
            month: "short",
            year: "2-digit",
          });

          byMonth.push({
            month: monthKey,
            monthLabel: monthLabelStr,
            total: onlineTotal + manualTotal,
            online: onlineTotal,
            manual: manualTotal,
            stages: stagesTotal,
            baptemes: baptemesTotal,
            giftVouchers: giftVouchersTotal,
          });
        }

        chart = { byMonth };

        // thisMonth KPIs
        const [
          thisMonthSoldAgg,
          thisMonthCollectedOnline,
          thisMonthCollectedManual,
          thisMonthPendingBalance,
        ] = await Promise.all([
          // totalSold: sum(Order.totalAmount) for orders with succeeded payment in period
          prisma.order.aggregate({
            where: {
              payments: {
                some: {
                  status: "SUCCEEDED",
                  createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
                },
              },
            },
            _sum: { totalAmount: true },
          }),
          // online collected
          prisma.payment.aggregate({
            where: {
              status: "SUCCEEDED",
              isManual: false,
              paymentType: { not: "GIFT_VOUCHER" },
              createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
            },
            _sum: { amount: true },
          }),
          // manual collected
          prisma.payment.aggregate({
            where: {
              status: "SUCCEEDED",
              isManual: true,
              paymentType: { not: "GIFT_VOUCHER" },
              createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
            },
            _sum: { amount: true },
          }),
          // pending balance: sum(OrderItem.remainingAmount) where !isFullyPaid, order created in period
          prisma.orderItem.aggregate({
            where: {
              isFullyPaid: false,
              remainingAmount: { gt: 0 },
              order: {
                createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
              },
            },
            _sum: { remainingAmount: true },
          }),
        ]);

        const thisMonthOnline = thisMonthCollectedOnline._sum.amount || 0;
        const thisMonthManual = thisMonthCollectedManual._sum.amount || 0;

        thisMonth = {
          totalSold: thisMonthSoldAgg._sum.totalAmount || 0,
          totalCollected: thisMonthOnline + thisMonthManual,
          onlineCollected: thisMonthOnline,
          manualCollected: thisMonthManual,
          pendingBalance: thisMonthPendingBalance._sum.remainingAmount || 0,
        };

        // prevMonth KPIs
        const [
          prevMonthSoldAgg,
          prevMonthCollectedOnline,
          prevMonthCollectedManual,
          prevMonthPendingBalance,
        ] = await Promise.all([
          prisma.order.aggregate({
            where: {
              payments: {
                some: {
                  status: "SUCCEEDED",
                  createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
                },
              },
            },
            _sum: { totalAmount: true },
          }),
          prisma.payment.aggregate({
            where: {
              status: "SUCCEEDED",
              isManual: false,
              paymentType: { not: "GIFT_VOUCHER" },
              createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
            },
            _sum: { amount: true },
          }),
          prisma.payment.aggregate({
            where: {
              status: "SUCCEEDED",
              isManual: true,
              paymentType: { not: "GIFT_VOUCHER" },
              createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
            },
            _sum: { amount: true },
          }),
          prisma.orderItem.aggregate({
            where: {
              isFullyPaid: false,
              remainingAmount: { gt: 0 },
              order: {
                createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
              },
            },
            _sum: { remainingAmount: true },
          }),
        ]);

        const prevMonthOnline = prevMonthCollectedOnline._sum.amount || 0;
        const prevMonthManual = prevMonthCollectedManual._sum.amount || 0;

        prevMonth = {
          totalSold: prevMonthSoldAgg._sum.totalAmount || 0,
          totalCollected: prevMonthOnline + prevMonthManual,
          onlineCollected: prevMonthOnline,
          manualCollected: prevMonthManual,
          pendingBalance: prevMonthPendingBalance._sum.remainingAmount || 0,
        };

        // Reservations stats for current month
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const [
          stageBookingsThisMonth,
          baptemeBookingsThisMonth,
          newStagiairesThisMonth,
          upcomingStagesForFill,
        ] = await Promise.all([
          prisma.stageBooking.count({
            where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
          }),
          prisma.baptemeBooking.count({
            where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
          }),
          prisma.stagiaire.count({
            where: { createdAt: { gte: currentMonthStart, lte: currentMonthEnd } },
          }),
          prisma.stage.findMany({
            where: { startDate: { gte: now, lte: thirtyDaysFromNow } },
            select: {
              places: true,
              _count: { select: { bookings: true } },
            },
          }),
        ]);

        const upcomingTotalPlaces = upcomingStagesForFill.reduce(
          (s, st) => s + st.places,
          0
        );
        const upcomingReservedPlaces = upcomingStagesForFill.reduce(
          (s, st) => s + st._count.bookings,
          0
        );
        const fillRate =
          upcomingTotalPlaces > 0
            ? Math.round((upcomingReservedPlaces / upcomingTotalPlaces) * 100)
            : 0;

        reservations = {
          stageBookingsThisMonth,
          baptemeBookingsThisMonth,
          newStagiairesThisMonth,
          newReservationsThisMonth: stageBookingsThisMonth + baptemeBookingsThisMonth,
          upcomingTotalPlaces,
          upcomingReservedPlaces,
          fillRate,
        };
      }

      return c.json({
        success: true,
        data: {
          revenue:
            user?.role === "ADMIN"
              ? {
                  onlineRevenueThisMonth: onlineRevenue,
                  totalRevenueThisMonth: totalRevenueMonth,
                  totalRevenueThisYear: totalRevenueYear,
                }
              : null,
          last13MonthsRevenue: null, // replaced by chart.byMonth
          chart: user?.role === "ADMIN" ? chart : null,
          thisMonth: user?.role === "ADMIN" ? thisMonth : null,
          prevMonth: user?.role === "ADMIN" ? prevMonth : null,
          reservations: user?.role === "ADMIN" ? reservations : null,
          kpis,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return c.json(
        {
          success: false,
          message: "Error fetching dashboard statistics",
          data: null,
        },
        500
      );
    }
  })

  // GET today's full activity list (admin = all, monitor = their own)
  .get("/today", requireMonitor, async (c) => {
    try {
      const userId = c.get("userId");

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!user) {
        return c.json(
          { success: false, message: "User not found", data: null },
          404
        );
      }

      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      const isAdmin = user.role === "ADMIN";

      const stageWhere = isAdmin
        ? { startDate: { gte: startOfDay, lte: endOfDay } }
        : {
            startDate: { gte: startOfDay, lte: endOfDay },
            moniteurs: { some: { moniteurId: user.id } },
          };

      const baptemeWhere = isAdmin
        ? { date: { gte: startOfDay, lte: endOfDay } }
        : {
            date: { gte: startOfDay, lte: endOfDay },
            moniteurs: { some: { moniteurId: user.id } },
          };

      const [stages, baptemes] = await Promise.all([
        prisma.stage.findMany({
          where: stageWhere,
          include: {
            bookings: {
              include: {
                stagiaire: true,
                orderItem: true,
              },
            },
          },
          orderBy: { startDate: "asc" },
        }),
        prisma.bapteme.findMany({
          where: baptemeWhere,
          include: {
            bookings: {
              include: {
                stagiaire: true,
                orderItem: true,
              },
            },
          },
          orderBy: { date: "asc" },
        }),
      ]);

      const formattedStages = stages.map((stage) => ({
        id: stage.id,
        type: stage.type,
        startDate: stage.startDate,
        duration: stage.duration,
        places: stage.places,
        bookingsCount: stage.bookings.length,
        participants: stage.bookings.map((booking) => {
          const oi = booking.orderItem;
          const isFullyPaid = oi?.isFullyPaid ?? false;
          const totalPrice = oi?.totalPrice ?? 0;
          const depositAmount = oi?.depositAmount ?? null;
          const remainingAmount = oi?.remainingAmount ?? null;
          const effectiveRemainingAmount = oi?.effectiveRemainingAmount ?? null;

          let amountPaid: number;
          if (isFullyPaid) {
            amountPaid = totalPrice;
          } else {
            const remaining = effectiveRemainingAmount ?? remainingAmount ?? 0;
            amountPaid = totalPrice - remaining;
          }

          return {
            bookingId: booking.id,
            shortCode: booking.shortCode ?? null,
            firstName: booking.stagiaire.firstName,
            lastName: booking.stagiaire.lastName,
            email: booking.stagiaire.email,
            phone: booking.stagiaire.phone,
            weight: booking.stagiaire.weight,
            height: booking.stagiaire.height,
            bookingType: booking.type,
            totalPrice,
            depositAmount,
            remainingAmount,
            effectiveRemainingAmount,
            isFullyPaid,
            amountPaid,
          };
        }),
      }));

      const formattedBaptemes = baptemes.map((bapteme) => ({
        id: bapteme.id,
        date: bapteme.date,
        duration: bapteme.duration,
        places: bapteme.places,
        categories: bapteme.categories,
        bookingsCount: bapteme.bookings.length,
        participants: bapteme.bookings.map((booking) => {
          const oi = booking.orderItem;
          const isFullyPaid = oi?.isFullyPaid ?? false;
          const totalPrice = oi?.totalPrice ?? 0;
          const depositAmount = oi?.depositAmount ?? null;
          const remainingAmount = oi?.remainingAmount ?? null;
          const effectiveRemainingAmount = oi?.effectiveRemainingAmount ?? null;

          let amountPaid: number;
          if (isFullyPaid) {
            amountPaid = totalPrice;
          } else {
            const remaining = effectiveRemainingAmount ?? remainingAmount ?? 0;
            amountPaid = totalPrice - remaining;
          }

          return {
            bookingId: booking.id,
            shortCode: booking.shortCode ?? null,
            firstName: booking.stagiaire.firstName,
            lastName: booking.stagiaire.lastName,
            email: booking.stagiaire.email,
            phone: booking.stagiaire.phone,
            weight: booking.stagiaire.weight,
            height: booking.stagiaire.height,
            category: booking.category,
            hasVideo: booking.hasVideo,
            totalPrice,
            depositAmount,
            remainingAmount,
            effectiveRemainingAmount,
            isFullyPaid,
            amountPaid,
          };
        }),
      }));

      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      return c.json({
        success: true,
        data: {
          date: dateStr,
          stages: formattedStages,
          baptemes: formattedBaptemes,
        },
      });
    } catch (error) {
      console.error("Error fetching today activities:", error);
      return c.json(
        {
          success: false,
          message: "Error fetching today activities",
          data: null,
        },
        500
      );
    }
  })

  // GET monitor's daily schedule
  .get("/monitor-schedule", requireMonitor, async (c) => {
    try {
      const userId = c.get("userId");

      // Fetch user to check role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true },
      });

      if (!user) {
        return c.json(
          { success: false, message: "User not found", data: null },
          404
        );
      }

      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59
      );

      // Fetch stages where this monitor is assigned for today
      const stages = await prisma.stage.findMany({
        where: {
          startDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          moniteurs: {
            some: {
              moniteurId: user.id,
            },
          },
        },
        include: {
          bookings: {
            include: {
              stagiaire: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Fetch baptemes where this monitor is assigned for today
      const baptemes = await prisma.bapteme.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          moniteurs: {
            some: {
              moniteurId: user.id,
            },
          },
        },
        include: {
          bookings: {
            include: {
              stagiaire: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Fetch next upcoming stage (after today)
      const nextStage = await prisma.stage.findFirst({
        where: {
          startDate: {
            gt: endOfDay,
          },
          moniteurs: {
            some: {
              moniteurId: user.id,
            },
          },
        },
        orderBy: {
          startDate: "asc",
        },
        include: {
          bookings: {
            include: {
              stagiaire: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Fetch next upcoming bapteme (after today)
      const nextBapteme = await prisma.bapteme.findFirst({
        where: {
          date: {
            gt: endOfDay,
          },
          moniteurs: {
            some: {
              moniteurId: user.id,
            },
          },
        },
        orderBy: {
          date: "asc",
        },
        include: {
          bookings: {
            include: {
              stagiaire: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
        },
      });

      // Format the data
      const formattedStages = stages.map((stage) => ({
        id: stage.id,
        startDate: stage.startDate,
        duration: stage.duration,
        type: stage.type,
        bookingsCount: stage.bookings.length,
        participants: stage.bookings.map((booking) => ({
          id: booking.id,
          name: `${booking.stagiaire.firstName} ${booking.stagiaire.lastName}`,
          email: booking.stagiaire.email,
          phone: booking.stagiaire.phone,
        })),
      }));

      const formattedBaptemes = baptemes.map((bapteme) => ({
        id: bapteme.id,
        date: bapteme.date,
        duration: bapteme.duration,
        bookingsCount: bapteme.bookings.length,
        participants: bapteme.bookings.map((booking) => ({
          id: booking.id,
          name: `${booking.stagiaire.firstName} ${booking.stagiaire.lastName}`,
          email: booking.stagiaire.email,
          phone: booking.stagiaire.phone,
          category: booking.category,
        })),
      }));

      // Format upcoming activities
      const formattedNextStage = nextStage
        ? {
            id: nextStage.id,
            startDate: nextStage.startDate,
            duration: nextStage.duration,
            type: nextStage.type,
            bookingsCount: nextStage.bookings.length,
            participants: nextStage.bookings.map((booking) => ({
              id: booking.id,
              name: `${booking.stagiaire.firstName} ${booking.stagiaire.lastName}`,
              email: booking.stagiaire.email,
              phone: booking.stagiaire.phone,
            })),
          }
        : null;

      const formattedNextBapteme = nextBapteme
        ? {
            id: nextBapteme.id,
            date: nextBapteme.date,
            duration: nextBapteme.duration,
            bookingsCount: nextBapteme.bookings.length,
            participants: nextBapteme.bookings.map((booking) => ({
              id: booking.id,
              name: `${booking.stagiaire.firstName} ${booking.stagiaire.lastName}`,
              email: booking.stagiaire.email,
              phone: booking.stagiaire.phone,
              category: booking.category,
            })),
          }
        : null;

      return c.json({
        success: true,
        data: {
          stages: formattedStages,
          baptemes: formattedBaptemes,
          upcoming: {
            nextStage: formattedNextStage,
            nextBapteme: formattedNextBapteme,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching monitor schedule:", error);
      return c.json(
        {
          success: false,
          message: "Error fetching monitor schedule",
          data: null,
        },
        500
      );
    }
  });

export default app;
