import "server-only";
import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";

/**
 * Hybrid middleware: accepts either a valid API key (x-api-key) OR a valid session.
 * Used for routes accessible from both the public frontend and authenticated admin users.
 * Rejects with 401 if neither condition is met.
 */
export const requireSessionOrApiKey = createMiddleware(async (c, next) => {
  const correctAPIKey = process.env.PUBLIC_API_KEY;
  const apiKey = c.req.header("x-api-key");

  if (apiKey && correctAPIKey && apiKey === correctAPIKey) {
    await next();
    return;
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
