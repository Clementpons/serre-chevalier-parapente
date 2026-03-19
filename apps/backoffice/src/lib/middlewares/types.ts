import type { CartSession } from "@prisma/client";

/**
 * Typed environment shared across all Hono middlewares and route handlers.
 * Only variables set by a middleware should be accessed in routes that use it.
 */
export type AppEnv = {
  Variables: {
    userId: string;
    role: string;
    cartSession: CartSession;
  };
};
