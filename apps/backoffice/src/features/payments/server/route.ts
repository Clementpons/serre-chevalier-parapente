import { Hono } from "hono";
import { requireAdmin } from "@/lib/middlewares";
import prisma from "@/lib/prisma";

const app = new Hono()
  // GET all payments (admin only)
  .get("/", requireAdmin, async (c) => {
    try {
      const payments = await prisma.payment.findMany({
        include: {
          order: {
            include: {
              client: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          recordedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          allocations: {
            include: {
              orderItem: {
                select: {
                  id: true,
                  type: true,
                  quantity: true,
                  unitPrice: true,
                  totalPrice: true,
                  giftVoucherAmount: true,
                  participantData: true,
                  stage: {
                    select: {
                      id: true,
                      startDate: true,
                      type: true,
                    },
                  },
                  bapteme: {
                    select: {
                      id: true,
                      date: true,
                    },
                  },
                  stageBooking: {
                    select: {
                      id: true,
                      stagiaire: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                        },
                      },
                    },
                  },
                  baptemeBooking: {
                    select: {
                      id: true,
                      stagiaire: {
                        select: {
                          id: true,
                          firstName: true,
                          lastName: true,
                          email: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return c.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      console.error("Erreur récupération paiements:", error);
      return c.json(
        {
          success: false,
          message: "Erreur lors de la récupération des paiements",
          data: null,
        },
        500,
      );
    }
  });

export default app;
