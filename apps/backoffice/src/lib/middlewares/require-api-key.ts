import "server-only";
import { createMiddleware } from "hono/factory";

/**
 * Requires a valid `x-api-key` header matching PUBLIC_API_KEY env var.
 * Used to authenticate the public frontend (apps/front) against the API.
 * Rejects with 401 if missing or invalid, 500 if env var is not set.
 */
export const requireApiKey = createMiddleware(async (c, next) => {
  const correctAPIKey = process.env.PUBLIC_API_KEY;
  const apiKey = c.req.header("x-api-key");

  if (!correctAPIKey) {
    console.error("PUBLIC_API_KEY environment variable is not set");
    return c.json({ error: "Server configuration error" }, 500);
  }

  if (!apiKey || apiKey !== correctAPIKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
