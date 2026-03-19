import "server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import type { AppEnv } from "./types";

/**
 * Requires an authenticated session with ADMIN role.
 * Sets `userId` in context variables.
 * Rejects with 401 if not authenticated or not ADMIN.
 */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized, admin only" }, 401);
  }

  if (session.user.role !== "ADMIN") {
    return c.json({ error: "Unauthorized, admin only" }, 401);
  }

  c.set("userId", session.user.id);
  await next();
});
