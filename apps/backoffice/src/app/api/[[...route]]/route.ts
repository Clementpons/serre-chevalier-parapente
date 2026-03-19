import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "@/features/users/server/route";
import clients from "@/features/clients/server/route";
import stagiaires from "@/features/stagiaires/server/route";
import stages from "@/features/stages/server/route";
import reservationStages from "@/features/reservations/stages/server/route";
import reservations from "@/features/reservations/server/route";
import baptemes from "@/features/biplaces/server/route";
import promocodes from "@/features/promocodes/server/route";
import audiences from "@/features/audiences/server/route";
import giftvouchers from "@/features/giftvouchers/server/route";
import cart from "@/features/cart/server/route";
import availability from "@/features/availability/server/route";
import orders from "@/features/orders/server/route";
import tarifs from "@/features/tarifs/server/route";
import payments from "@/features/payments/server/route";
import dashboard from "@/features/dashboard/server/route";
import content from "@/features/content/server/route";
import campaigns from "@/features/campaigns/server/route";
import { cors } from "hono/cors";

const app = new Hono().basePath("/api");

const routes = app
  .use(
    "*",
    cors({
      origin: (origin) => {
        return [
          "http://localhost:3000",
          "http://localhost:3001",
          "https://serreche-parapente-front.vercel.app",
          "https://serreche-parapente-backoffice.vercel.app",
          "https://www.stage-de-parapente.fr",
          "https://www.serre-chevalier-parapente.fr",
        ].includes(origin ?? "")
          ? origin
          : "";
      },
      allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "x-api-key", "x-session-id"],
    }),
  )
  // .use("*", async (c, next) => {
  //   console.log("Incoming request:", c.req.method, c.req.path);
  //   await next();
  // })
  .route("/users", users)
  .route("/clients", clients)
  .route("/stagiaires", stagiaires)
  .route("/stages", stages)
  .route("/reservationStages", reservationStages)
  .route("/reservations", reservations)
  .route("/baptemes", baptemes)
  .route("/promocodes", promocodes)
  .route("/audiences", audiences)
  .route("/giftvouchers", giftvouchers)
  .route("/cart", cart)
  .route("/availability", availability)
  .route("/orders", orders)
  .route("/tarifs", tarifs)
  .route("/payments", payments)
  .route("/dashboard", dashboard)
  .route("/content", content)
  .route("/campaigns", campaigns);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);

export type AppType = typeof routes;
