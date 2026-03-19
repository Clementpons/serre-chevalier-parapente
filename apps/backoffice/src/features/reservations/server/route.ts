import { Hono } from "hono";
import { requireAdmin, requireMonitor } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const RecordManualPaymentSchema = z.object({
  orderItemId: z.string(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH", "CHECK"]),
  note: z.string().optional(),
});

const RecordFinalDiscountSchema = z.object({
  orderItemId: z.string(),
  amount: z.number().positive(),
  note: z.string().optional(),
});

const GetReservationsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  type: z.enum(["ALL", "STAGE", "BAPTEME"]).optional().default("ALL"),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  category: z.string().optional(),
});

const app = new Hono()
  // GET all reservations with advanced filters and pagination
  .get(
    "/",
    requireMonitor,
    zValidator("query", GetReservationsSchema),
    async (c) => {
      try {
        const {
          page,
          limit,
          search,
          type,
          status,
          startDate,
          endDate,
          category,
        } = c.req.valid("query");

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build date filters
        const dateFilter = {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        };

        // Build status filter
        const statusFilter = status
          ? { in: status.split(",") }
          : { in: ["PAID", "CONFIRMED", "PARTIALLY_PAID", "FULLY_PAID"] };

        let stageBookings: any[] = [];
        let stageCount = 0;
        let baptemeBookings: any[] = [];
        let baptemeCount = 0;

        // Fetch stage bookings if needed
        if (type === "ALL" || type === "STAGE") {
          const stageWhere: any = {
            orderItem: {
              is: {
                order: {
                  status: statusFilter,
                },
              },
            },
          };

          if (Object.keys(dateFilter).length > 0) {
            stageWhere.stage = { startDate: dateFilter };
          }

          if (search) {
            stageWhere.OR = [
              {
                stagiaire: {
                  firstName: { contains: search, mode: "insensitive" },
                },
              },
              {
                stagiaire: {
                  lastName: { contains: search, mode: "insensitive" },
                },
              },
              {
                stagiaire: { email: { contains: search, mode: "insensitive" } },
              },
              {
                orderItem: {
                  is: {
                    order: {
                      orderNumber: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              },
            ];
          }

          if (category) {
            stageWhere.type = category;
          }

          [stageBookings, stageCount] = await Promise.all([
            prisma.stageBooking.findMany({
              where: stageWhere,
              include: {
                stagiaire: true,
                stage: {
                  include: {
                    moniteurs: {
                      include: {
                        moniteur: true,
                      },
                    },
                  },
                },
                orderItem: {
                  include: {
                    order: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              skip: type === "STAGE" ? skip : 0,
              take: type === "STAGE" ? limitNum : undefined,
            }),
            prisma.stageBooking.count({ where: stageWhere }),
          ]);
        }

        // Fetch bapteme bookings if needed
        if (type === "ALL" || type === "BAPTEME") {
          const baptemeWhere: any = {
            orderItem: {
              is: {
                order: {
                  status: statusFilter,
                },
              },
            },
          };

          if (Object.keys(dateFilter).length > 0) {
            baptemeWhere.bapteme = { date: dateFilter };
          }

          if (search) {
            baptemeWhere.OR = [
              {
                stagiaire: {
                  firstName: { contains: search, mode: "insensitive" },
                },
              },
              {
                stagiaire: {
                  lastName: { contains: search, mode: "insensitive" },
                },
              },
              {
                stagiaire: { email: { contains: search, mode: "insensitive" } },
              },
              {
                orderItem: {
                  is: {
                    order: {
                      orderNumber: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              },
            ];
          }

          if (category) {
            baptemeWhere.category = category;
          }

          [baptemeBookings, baptemeCount] = await Promise.all([
            prisma.baptemeBooking.findMany({
              where: baptemeWhere,
              include: {
                stagiaire: true,
                bapteme: {
                  include: {
                    moniteurs: {
                      include: {
                        moniteur: true,
                      },
                    },
                  },
                },
                orderItem: {
                  include: {
                    order: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              skip: type === "BAPTEME" ? skip : 0,
              take: type === "BAPTEME" ? limitNum : undefined,
            }),
            prisma.baptemeBooking.count({ where: baptemeWhere }),
          ]);
        }

        // Combine and sort results for "ALL" type
        let combinedResults = [];
        let totalCount = 0;

        if (type === "ALL") {
          // Combine both arrays
          const allBookings = [
            ...stageBookings.map((b) => ({
              ...b,
              bookingType: "STAGE" as const,
              date: b.stage.startDate,
            })),
            ...baptemeBookings.map((b) => ({
              ...b,
              bookingType: "BAPTEME" as const,
              date: b.bapteme.date,
            })),
          ];

          // Sort by creation date descending (most recent first)
          allBookings.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          // Apply pagination
          combinedResults = allBookings.slice(skip, skip + limitNum);
          totalCount = stageCount + baptemeCount;
        } else if (type === "STAGE") {
          combinedResults = stageBookings.map((b) => ({
            ...b,
            bookingType: "STAGE" as const,
          }));
          totalCount = stageCount;
        } else {
          combinedResults = baptemeBookings.map((b) => ({
            ...b,
            bookingType: "BAPTEME" as const,
          }));
          totalCount = baptemeCount;
        }

        const totalPages = Math.ceil(totalCount / limitNum);

        return c.json({
          success: true,
          data: {
            reservations: combinedResults,
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: totalCount,
              totalPages,
              hasMore: pageNum < totalPages,
            },
            stats: {
              totalStages: stageCount,
              totalBaptemes: baptemeCount,
              total: stageCount + baptemeCount,
            },
          },
        });
      } catch (error) {
        console.error("Erreur récupération réservations:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de la récupération des réservations",
            data: null,
          },
          500,
        );
      }
    },
  )
  // GET single reservation by ID with complete details
  .get("/:id", requireMonitor, async (c) => {
    try {
      const id = c.req.param("id");

      // Try to find as stage booking first
      let stageBooking = await prisma.stageBooking.findUnique({
        where: { id },
        include: {
          stagiaire: true,
          stage: {
            include: {
              moniteurs: {
                include: {
                  moniteur: true,
                },
              },
              bookings: {
                where: {
                  orderItem: {
                    is: {
                      order: {
                        status: {
                          in: [
                            "PAID",
                            "PARTIALLY_PAID",
                            "FULLY_PAID",
                            "CONFIRMED",
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          orderItem: {
            include: {
              usedGiftVoucher: true,
              order: {
                include: {
                  client: true,
                  promoCode: true,
                  payments: {
                    include: {
                      recordedByUser: true,
                    },
                    orderBy: {
                      createdAt: "asc",
                    },
                  },
                },
              },
              paymentAllocations: {
                include: {
                  payment: {
                    include: {
                      recordedByUser: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: "asc",
                },
              } as any,
            },
          },
        },
      });

      if (stageBooking) {
        // Calculate remaining places
        const totalPlaces = (stageBooking as any).stage.places;
        const confirmedBookings = (stageBooking as any).stage.bookings.length;
        const remainingPlaces = totalPlaces - confirmedBookings;

        return c.json({
          success: true,
          data: {
            type: "STAGE",
            booking: stageBooking,
            availablePlaces: {
              total: totalPlaces,
              confirmed: confirmedBookings,
              remaining: remainingPlaces,
            },
          },
        });
      }

      // Try to find as bapteme booking
      let baptemeBooking = await prisma.baptemeBooking.findUnique({
        where: { id },
        include: {
          stagiaire: true,
          bapteme: {
            include: {
              moniteurs: {
                include: {
                  moniteur: true,
                },
              },
              bookings: {
                where: {
                  orderItem: {
                    is: {
                      order: {
                        status: {
                          in: [
                            "PAID",
                            "PARTIALLY_PAID",
                            "FULLY_PAID",
                            "CONFIRMED",
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          orderItem: {
            include: {
              order: {
                include: {
                  client: true,
                  promoCode: true,
                  payments: {
                    orderBy: {
                      createdAt: "asc",
                    },
                  },
                },
              },
              paymentAllocations: {
                include: {
                  payment: true,
                },
                orderBy: {
                  createdAt: "asc",
                },
              } as any,
            },
          },
        },
      });

      if (baptemeBooking) {
        // Calculate remaining places
        const totalPlaces = (baptemeBooking as any).bapteme.places;
        const confirmedBookings = (baptemeBooking as any).bapteme.bookings
          .length;
        const remainingPlaces = totalPlaces - confirmedBookings;

        return c.json({
          success: true,
          data: {
            type: "BAPTEME",
            booking: baptemeBooking,
            availablePlaces: {
              total: totalPlaces,
              confirmed: confirmedBookings,
              remaining: remainingPlaces,
            },
          },
        });
      }

      return c.json(
        {
          success: false,
          message: "Réservation non trouvée",
          data: null,
        },
        404,
      );
    } catch (error) {
      console.error("Erreur récupération détails réservation:", error);
      return c.json(
        {
          success: false,
          message:
            "Erreur lors de la récupération des détails de la réservation",
          data: null,
        },
        500,
      );
    }
  })
  // POST - Record a manual payment for a reservation
  .post(
    "/manual-payment",
    requireAdmin,
    zValidator("json", RecordManualPaymentSchema),
    async (c) => {
      try {
        const { orderItemId, amount, paymentMethod, note } =
          c.req.valid("json");

        // Get the order item with order details
        const orderItem = await prisma.orderItem.findUnique({
          where: { id: orderItemId },
          include: {
            order: true,
          },
        });

        if (!orderItem) {
          return c.json(
            {
              success: false,
              message: "Réservation non trouvée",
            },
            404,
          );
        }

        const order = orderItem.order;

        // Create the manual payment record
        const payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            amount,
            currency: "eur",
            status: "SUCCEEDED",
            isManual: true,
            manualPaymentMethod: paymentMethod,
            manualPaymentNote: note,
            recordedBy: c.get("userId"), // ID de l'admin/moniteur qui enregistre le paiement
          },
        });

        // Create payment allocation for this specific OrderItem
        await (prisma as any).paymentAllocation.create({
          data: {
            paymentId: payment.id,
            orderItemId: orderItem.id,
            allocatedAmount: amount,
          },
        });

        // Calculate new amounts
        const depositAmount = orderItem.depositAmount || 0;
        const remainingAmount = orderItem.remainingAmount || 0;
        const totalPrice = orderItem.totalPrice;

        // Determine if this is a deposit payment or remaining payment
        let newDepositAmount = depositAmount;
        let newRemainingAmount = remainingAmount;
        let isFullyPaid = orderItem.isFullyPaid;

        if (depositAmount === 0) {
          // This is the first payment (deposit)
          newDepositAmount = amount;
          newRemainingAmount = totalPrice - amount;
        } else {
          // This is a payment towards the remaining amount
          newRemainingAmount = Math.max(0, remainingAmount - amount);
          if (newRemainingAmount === 0) {
            isFullyPaid = true;
          }
        }

        // Update ONLY this specific order item (not the whole order)
        await prisma.orderItem.update({
          where: { id: orderItemId },
          data: {
            depositAmount: newDepositAmount,
            remainingAmount: newRemainingAmount,
            isFullyPaid,
            ...(isFullyPaid && {
              finalPaymentDate: new Date(),
              finalPaymentNote: note || `Paiement manuel par ${paymentMethod}`,
            }),
          },
        });

        // Check if ALL order items are fully paid to update order status
        const allOrderItems = await prisma.orderItem.findMany({
          where: { orderId: order.id },
        });

        const allItemsFullyPaid = allOrderItems.every((item) => {
          // Gift vouchers used for reservation are always considered "paid"
          if (item.type === "GIFT_VOUCHER") return true;
          // Baptemes are paid in full upfront
          if (item.type === "BAPTEME") return true;
          // Stages need to check isFullyPaid
          if (item.type === "STAGE")
            return item.id === orderItemId ? isFullyPaid : item.isFullyPaid;
          return false;
        });

        const hasAnyPartialPayment = allOrderItems.some((item) => {
          if (item.type === "STAGE") {
            const itemIsFullyPaid =
              item.id === orderItemId ? isFullyPaid : item.isFullyPaid;
            return !itemIsFullyPaid && (item.depositAmount || 0) > 0;
          }
          return false;
        });

        // Update order status based on ALL items
        let newOrderStatus = order.status;
        if (allItemsFullyPaid) {
          newOrderStatus = "FULLY_PAID";
        } else if (hasAnyPartialPayment) {
          newOrderStatus = "PARTIALLY_PAID";
        }

        if (newOrderStatus !== order.status) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: newOrderStatus,
            },
          });
        }

        return c.json({
          success: true,
          message: "Paiement enregistré avec succès",
          data: {
            payment,
            orderItem: {
              depositAmount: newDepositAmount,
              remainingAmount: newRemainingAmount,
              isFullyPaid,
            },
          },
        });
      } catch (error) {
        console.error("Erreur enregistrement paiement manuel:", error);
        return c.json(
          {
            success: false,
            message: "Erreur lors de l'enregistrement du paiement",
          },
          500,
        );
      }
    },
  )
  // POST - Record a final discount (geste commercial, not counted in revenue)
  .post(
    "/final-discount",
    requireAdmin,
    zValidator("json", RecordFinalDiscountSchema),
    async (c) => {
      try {
        const { orderItemId, amount, note } = c.req.valid("json");

        const orderItem = await prisma.orderItem.findUnique({
          where: { id: orderItemId },
          include: {
            order: true,
            paymentAllocations: {
              include: { payment: true },
            } as any,
          },
        });

        if (!orderItem) {
          return c.json({ success: false, message: "Réservation non trouvée" }, 404);
        }

        // Calculate actual amount paid so far (from allocations)
        const totalPaid = (orderItem as any).paymentAllocations.reduce(
          (sum: number, a: any) => {
            if (a.payment?.status === "SUCCEEDED") return sum + a.allocatedAmount;
            return sum;
          },
          0,
        );

        const existingDiscount = (orderItem as any).finalDiscountAmount || 0;
        const dynamicRemaining = Math.max(
          0,
          orderItem.totalPrice - totalPaid - existingDiscount,
        );

        if (amount > dynamicRemaining) {
          return c.json(
            {
              success: false,
              message: `La réduction (${amount}€) dépasse le solde restant (${dynamicRemaining.toFixed(2)}€)`,
            },
            400,
          );
        }

        const newDiscount = existingDiscount + amount;
        const newRemaining = Math.max(0, dynamicRemaining - amount);
        const isFullyPaid = newRemaining === 0;

        await (prisma.orderItem.update as any)({
          where: { id: orderItemId },
          data: {
            finalDiscountAmount: newDiscount,
            finalDiscountNote: note,
            finalDiscountDate: new Date(),
            ...(isFullyPaid && !orderItem.isFullyPaid && {
              isFullyPaid: true,
              finalPaymentDate: new Date(),
              finalPaymentNote: note || "Solde couvert par réduction finale",
            }),
          },
        });

        // Update order status if item is now fully paid
        if (isFullyPaid && !orderItem.isFullyPaid) {
          const allOrderItems = await prisma.orderItem.findMany({
            where: { orderId: orderItem.order.id },
          });

          const allItemsFullyPaid = allOrderItems.every((item) => {
            if (item.type === "GIFT_VOUCHER") return true;
            if (item.type === "BAPTEME") return true;
            if (item.type === "STAGE")
              return item.id === orderItemId ? isFullyPaid : item.isFullyPaid;
            return false;
          });

          if (allItemsFullyPaid) {
            await prisma.order.update({
              where: { id: orderItem.order.id },
              data: { status: "FULLY_PAID" },
            });
          }
        }

        return c.json({
          success: true,
          message: "Réduction enregistrée avec succès",
          data: {
            finalDiscountAmount: newDiscount,
            remainingAmount: newRemaining,
            isFullyPaid,
          },
        });
      } catch (error) {
        console.error("Erreur enregistrement réduction finale:", error);
        return c.json(
          { success: false, message: "Erreur lors de l'enregistrement de la réduction" },
          500,
        );
      }
    },
  );

export default app;
