/**
 * api-helpers.test.ts
 *
 * Unit tests for the centralised Hono response helpers in src/lib/api-helpers.ts.
 * A lightweight mock of Hono's Context is used so tests remain fast and free of
 * any HTTP/network overhead.
 */

import { describe, it, expect, vi } from "vitest";
import type { Context } from "hono";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import {
  apiOk,
  apiCreated,
  apiError,
  handleZodError,
  handlePrismaError,
  handleRouteError,
} from "@/lib/api-helpers";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Creates a minimal Hono Context mock that records c.json() calls. */
function makeCtx() {
  type Call = { body: unknown; status: number };
  const calls: Call[] = [];
  const json = vi.fn((body: unknown, status: number) => {
    calls.push({ body, status });
    return { body, status } as unknown as Response;
  });
  return { ctx: { json } as unknown as Context, calls };
}

/** Builds a PrismaClientKnownRequestError with the given Prisma error code. */
function makePrismaError(code: string) {
  return new Prisma.PrismaClientKnownRequestError("test error", {
    code,
    clientVersion: "5.0.0",
  });
}

// ---------------------------------------------------------------------------
// apiOk
// ---------------------------------------------------------------------------

describe("apiOk", () => {
  it("returns HTTP 200", () => {
    const { ctx, calls } = makeCtx();
    apiOk(ctx, { id: 1 });
    expect(calls[0].status).toBe(200);
  });

  it("sets success: true", () => {
    const { ctx, calls } = makeCtx();
    apiOk(ctx, null);
    expect((calls[0].body as any).success).toBe(true);
  });

  it("includes the data payload", () => {
    const { ctx, calls } = makeCtx();
    apiOk(ctx, { name: "test" });
    expect((calls[0].body as any).data).toEqual({ name: "test" });
  });

  it("defaults message to empty string", () => {
    const { ctx, calls } = makeCtx();
    apiOk(ctx, null);
    expect((calls[0].body as any).message).toBe("");
  });

  it("forwards a custom message", () => {
    const { ctx, calls } = makeCtx();
    apiOk(ctx, null, "Opération réussie");
    expect((calls[0].body as any).message).toBe("Opération réussie");
  });
});

// ---------------------------------------------------------------------------
// apiCreated
// ---------------------------------------------------------------------------

describe("apiCreated", () => {
  it("returns HTTP 201", () => {
    const { ctx, calls } = makeCtx();
    apiCreated(ctx, { id: 42 });
    expect(calls[0].status).toBe(201);
  });

  it("sets success: true with data", () => {
    const { ctx, calls } = makeCtx();
    apiCreated(ctx, { id: 42 });
    expect((calls[0].body as any).success).toBe(true);
    expect((calls[0].body as any).data).toEqual({ id: 42 });
  });
});

// ---------------------------------------------------------------------------
// apiError
// ---------------------------------------------------------------------------

describe("apiError", () => {
  it("defaults to HTTP 500", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "erreur serveur");
    expect(calls[0].status).toBe(500);
  });

  it("sets success: false", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "erreur");
    expect((calls[0].body as any).success).toBe(false);
  });

  it("sets data: null", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "erreur");
    expect((calls[0].body as any).data).toBeNull();
  });

  it("forwards the message", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "non trouvé", 404);
    expect((calls[0].body as any).message).toBe("non trouvé");
  });

  it("uses the provided status code (404)", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "non trouvé", 404);
    expect(calls[0].status).toBe(404);
  });

  it("uses the provided status code (401)", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "non autorisé", 401);
    expect(calls[0].status).toBe(401);
  });

  it("uses the provided status code (403)", () => {
    const { ctx, calls } = makeCtx();
    apiError(ctx, "interdit", 403);
    expect(calls[0].status).toBe(403);
  });
});

// ---------------------------------------------------------------------------
// handleZodError
// ---------------------------------------------------------------------------

describe("handleZodError", () => {
  it("returns HTTP 400", () => {
    const { ctx, calls } = makeCtx();
    handleZodError(ctx, new z.ZodError([{ code: "custom", message: "Champ requis", path: [] }]));
    expect(calls[0].status).toBe(400);
  });

  it("returns the first error message", () => {
    const { ctx, calls } = makeCtx();
    handleZodError(
      ctx,
      new z.ZodError([
        { code: "custom", message: "Premier problème", path: ["name"] },
        { code: "custom", message: "Deuxième problème", path: ["email"] },
      ]),
    );
    expect((calls[0].body as any).message).toBe("Premier problème");
  });

  it("falls back to default message when issues array is empty", () => {
    const { ctx, calls } = makeCtx();
    handleZodError(ctx, new z.ZodError([]));
    expect((calls[0].body as any).message).toBe(
      "Erreur dans la validation des données",
    );
  });

  it("sets success: false", () => {
    const { ctx, calls } = makeCtx();
    handleZodError(ctx, new z.ZodError([{ code: "custom", message: "err", path: [] }]));
    expect((calls[0].body as any).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// handlePrismaError
// ---------------------------------------------------------------------------

describe("handlePrismaError", () => {
  it("P2002 (unique constraint) → HTTP 400 with correct message", () => {
    const { ctx, calls } = makeCtx();
    handlePrismaError(ctx, makePrismaError("P2002"));
    expect(calls[0].status).toBe(400);
    expect((calls[0].body as any).message).toContain("existe déjà");
  });

  it("P2003 (foreign key) → HTTP 400 with correct message", () => {
    const { ctx, calls } = makeCtx();
    handlePrismaError(ctx, makePrismaError("P2003"));
    expect(calls[0].status).toBe(400);
    expect((calls[0].body as any).message).toContain("étrangère");
  });

  it("P2025 (not found) → HTTP 404 with correct message", () => {
    const { ctx, calls } = makeCtx();
    handlePrismaError(ctx, makePrismaError("P2025"));
    expect(calls[0].status).toBe(404);
    expect((calls[0].body as any).message).toContain("introuvable");
  });

  it("unknown code → HTTP 400 with generic message", () => {
    const { ctx, calls } = makeCtx();
    handlePrismaError(ctx, makePrismaError("P9999"));
    expect(calls[0].status).toBe(400);
    expect((calls[0].body as any).message).toContain("Erreur base de données");
  });

  it("always sets success: false and data: null", () => {
    const { ctx, calls } = makeCtx();
    handlePrismaError(ctx, makePrismaError("P2002"));
    expect((calls[0].body as any).success).toBe(false);
    expect((calls[0].body as any).data).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// handleRouteError (catch-all dispatcher)
// ---------------------------------------------------------------------------

describe("handleRouteError", () => {
  it("dispatches ZodError → 400", () => {
    const { ctx, calls } = makeCtx();
    handleRouteError(
      ctx,
      new z.ZodError([{ code: "custom", message: "err", path: [] }]),
    );
    expect(calls[0].status).toBe(400);
  });

  it("dispatches PrismaClientKnownRequestError P2025 → 404", () => {
    const { ctx, calls } = makeCtx();
    handleRouteError(ctx, makePrismaError("P2025"));
    expect(calls[0].status).toBe(404);
  });

  it("dispatches PrismaClientKnownRequestError P2002 → 400", () => {
    const { ctx, calls } = makeCtx();
    handleRouteError(ctx, makePrismaError("P2002"));
    expect(calls[0].status).toBe(400);
  });

  it("returns HTTP 500 for generic Error", () => {
    const { ctx, calls } = makeCtx();
    handleRouteError(ctx, new Error("unexpected"));
    expect(calls[0].status).toBe(500);
  });

  it("returns HTTP 500 for unknown thrown values", () => {
    const { ctx, calls } = makeCtx();
    handleRouteError(ctx, "string error");
    expect(calls[0].status).toBe(500);
  });
});
