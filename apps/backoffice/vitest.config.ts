import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: ["src/__tests__/**", "prisma/**", "src/scripts/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "server-only" throws at import time in non-Next.js environments.
      // Replace it with an empty module so lib utilities can be tested.
      "server-only": path.resolve(
        __dirname,
        "./src/__tests__/__mocks__/server-only.ts",
      ),
    },
  },
});
