import "server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

/**
 * Requires a valid better-auth session.
 * Rejects with 401 if the user is not authenticated.
 */
export const requireAuth = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});
