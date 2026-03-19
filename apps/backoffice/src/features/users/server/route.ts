import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAdmin, requireAuth, requireMonitor } from "@/lib/middlewares";
import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { ChangeUserRoleSchema } from "../schemas";

const app = new Hono()
  //*------------------*//
  //ALL GET REQUESTS API
  //*------------------*//
  //Get all users of the database
  .get("/", requireAdmin, async (c) => {
    try {
      const result = await prisma.user.findMany();
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching users",
        data: null,
      });
    }
  })
  //
  //Get one user by id
  .get("/:id", requireAuth, async (c) => {
    const { id } = c.req.param();
    if (!id) {
      return c.json({
        success: false,
        message: "User ID is required",
        data: null,
      });
    }

    try {
      const result = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching users by id",
        data: null,
      });
    }
  })
  //
  //Get all users by type
  .get("/by-role/:role", requireMonitor, async (c) => {
    const { role } = c.req.param();
    const typedRole = role as Role;
    if (!role || !Object.values(Role).includes(typedRole)) {
      return c.json({
        success: false,
        message: "Role ('ADMIN', 'MONITEUR', 'CUSTOMER') is required",
        data: null,
      });
    }

    try {
      const result = await prisma.user.findMany({
        where: {
          role: typedRole,
        },
      });

      return c.json({ success: true, message: "", data: result });
    } catch (error) {
      return c.json({
        success: false,
        message: "Error fetching user",
        data: null,
      });
    }
  })
  //
  // PATCH /users/:id/role — change user role
  .patch(
    "/:id/role",
    requireAdmin,
    zValidator("json", ChangeUserRoleSchema),
    async (c) => {
      const id = c.req.param("id");
      const { role } = c.req.valid("json");
      if (!id || !role) {
        return c.json({
          success: false,
          message: "Un user et un role sont requis",
          data: null,
        });
      }

      try {
        const result = await prisma.user.update({
          where: { id },
          data: { role: role as Role },
        });

        return c.json({
          success: true,
          message: `Compte de ${result.name} mis à jour vers le role "MONITEUR"`,
          data: result,
        });
      } catch (error) {
        return c.json({
          success: false,
          message: "Error updating user",
          data: null,
        });
      }
    }
  );
//
export default app;
