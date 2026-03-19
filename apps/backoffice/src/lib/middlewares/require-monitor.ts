import "server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import type { AppEnv } from "./types";

/**
 * Requires an authenticated session with ADMIN or MONITEUR role.
 * Sets `userId` and `role` in context variables.
 * Rejects with 401 if not authenticated or role is not allowed.
 */
export const requireMonitor = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MONITEUR") {
    return c.json({ error: "Unauthorized, forbidden role" }, 401);
  }

  c.set("userId", session.user.id);
  c.set("role", session.user.role as string);
  await next();
});
