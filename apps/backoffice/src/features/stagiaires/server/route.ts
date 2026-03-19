import { Hono } from "hono";
import { requireApiKey, requireMonitor } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { AddStagiaireSchema } from "../schemas";

const app = new Hono()
  //*------------------*//
  //ALL GET REQUESTS API
  //*------------------*//
  //Get all stagiaires of the database
  .get("/", requireMonitor, async (c) => {
    try {
      const { page, pageSize, sortBy, sortOrder, search, nopaging } =
        c.req.query();

      const p = parseInt(page) || 1;
      const ps = parseInt(pageSize) || 25;
      const skip = (p - 1) * ps;
      const isNoPaging = nopaging === "true";

      const where: any = search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

      let orderBy: any = {};
      if (sortBy === "name") {
        orderBy = [
          { lastName: sortOrder === "asc" ? "asc" : "desc" },
          { firstName: sortOrder === "asc" ? "asc" : "desc" },
        ];
      } else if (sortBy === "createdAt") {
        orderBy = { createdAt: sortOrder === "asc" ? "asc" : "desc" };
      } else {
        orderBy = { createdAt: "desc" };
      }

      const [totalCount, result] = await Promise.all([
        prisma.stagiaire.count({ where }),
        prisma.stagiaire.findMany({
          where,
          include: {
            stageBookings: {
              include: {
                stage: true,
              },
            },
            baptemeBookings: {
              include: {
                bapteme: true,
              },
            },
          },
          orderBy,
          ...(isNoPaging ? {} : { skip, take: ps }),
        }),
      ]);

      return c.json({
        success: true,
        message: "",
        data: {
          stagiaires: result,
          totalCount,
          page: p,
          pageSize: ps,
        },
      });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching stagiaires",
        data: null,
      });
    }
  })
  .get("/:id", requireMonitor, async (c) => {
    try {
      const id = c.req.param("id");
      if (!id) {
        return c.json({
          success: false,
          message: "ID is required",
          data: null,
        });
      }
      const result = await prisma.stagiaire.findUnique({
        where: { id },
        include: {
          stageBookings: {
            include: {
              stage: true,
            },
          },
          baptemeBookings: {
            include: {
              bapteme: true,
            },
          },
        },
      });
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching stagiaire",
        data: null,
      });
    }
  })
  //
  //Create new stagiaire
  .post(
    "/",
    requireApiKey,
    zValidator("json", AddStagiaireSchema),
    async (c) => {
      const { email, firstName, height, lastName, phone, weight, birthDate } =
        c.req.valid("json");

      if (!firstName || !lastName || !email || !phone || !height || !weight) {
        return c.json({
          success: false,
          message: "Il manque des champs",
          data: null,
        });
      }

      try {
        const result = await prisma.stagiaire.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
            height: Number(height),
            weight: Number(weight),
            birthDate: birthDate ? new Date(birthDate) : undefined,
          },
        });

        return c.json({
          success: true,
          message: `Stagiaire ${result.firstName} ${result.lastName} enregistré avec succès`,
          data: result,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: "Error creating stagiaire",
          data: null,
        });
      }
    },
  );

export default app;
