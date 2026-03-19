import type { Context } from "hono";
import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Standardised API response helpers for Hono route handlers.
 *
 * Usage:
 *   return apiOk(c, data);
 *   return apiCreated(c, data, "Resource created");
 *   return apiError(c, "Not found", 404);
 *   return handlePrismaError(c, error);
 */

// ---------------------------------------------------------------------------
// Success responses
// ---------------------------------------------------------------------------

export function apiOk<T>(c: Context, data: T, message = "") {
  return c.json({ success: true, message, data }, 200);
}

export function apiCreated<T>(c: Context, data: T, message = "") {
  return c.json({ success: true, message, data }, 201);
}

// ---------------------------------------------------------------------------
// Error responses
// ---------------------------------------------------------------------------

export function apiError(
  c: Context,
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 500 = 500,
) {
  return c.json({ success: false, message, data: null }, status);
}

// ---------------------------------------------------------------------------
// Zod validation errors
// ---------------------------------------------------------------------------

export function handleZodError(c: Context, error: z.ZodError) {
  const firstMessage =
    error.errors.length > 0
      ? error.errors[0].message
      : "Erreur dans la validation des données";
  return c.json({ success: false, message: firstMessage, data: null }, 400);
}

// ---------------------------------------------------------------------------
// Prisma known request errors
// ---------------------------------------------------------------------------

const PRISMA_MESSAGES: Record<string, string> = {
  P2002: "Un enregistrement avec ces valeurs existe déjà.",
  P2003: "Clé étrangère introuvable.",
  P2025: "Enregistrement introuvable.",
};

export function handlePrismaError(
  c: Context,
  error: Prisma.PrismaClientKnownRequestError,
) {
  const message =
    PRISMA_MESSAGES[error.code] ?? `Erreur base de données: ${error.message}`;
  const status = error.code === "P2025" ? 404 : 400;
  return c.json({ success: false, message, data: null }, status as 400 | 404);
}

// ---------------------------------------------------------------------------
// Generic catch-all for route handlers
// ---------------------------------------------------------------------------

export function handleRouteError(c: Context, error: unknown) {
  if (error instanceof z.ZodError) return handleZodError(c, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError)
    return handlePrismaError(c, error);
  console.error("[API Error]", error);
  return apiError(c, "Une erreur inattendue s'est produite.", 500);
}
