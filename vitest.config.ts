import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests for the requester surface's pure logic (resolvers, seasonality).
// The "@" alias mirrors tsconfig so test imports match app imports.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
