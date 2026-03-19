import "server-only";
import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import prisma from "@/lib/prisma";
import type { AppEnv } from "./types";

/**
 * Resolves the anonymous cart session from the `x-session-id` header (or `cart-session` cookie).
 * Creates a new CartSession in the DB if the session ID is new or expired.
 * Sets `cartSession` in context variables.
 * Rejects with 400 if no session ID is provided.
 */
export const requireCartSession = createMiddleware<AppEnv>(async (c, next) => {
  const sessionId =
    c.req.header("x-session-id") || getCookie(c, "cart-session");

  if (!sessionId) {
    return c.json({ error: "Session ID required" }, 400);
  }

  let session = await prisma.cartSession.findUnique({
    where: { sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session && session.expiresAt < new Date()) {
      await prisma.cartSession.delete({ where: { id: session.id } });
    }

    session = await prisma.cartSession.create({
      data: {
        sessionId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });
  }

  c.set("cartSession", session);
  await next();
});
