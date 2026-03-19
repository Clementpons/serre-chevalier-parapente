/**
 * @deprecated All feature routes now import directly from "@/lib/middlewares".
 * This file is kept only in case external tooling or scripts reference it.
 * Do NOT add new imports here — use "@/lib/middlewares" instead.
 */
export {
  requireAuth as sessionMiddleware,
  requireAdmin as adminSessionMiddleware,
  requireMonitor as monitorSessionMiddleware,
  requireApiKey as publicAPIMiddleware,
  requireSessionOrApiKey as sessionOrAPIMiddleware,
} from "@/lib/middlewares";
