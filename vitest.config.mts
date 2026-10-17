import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import { defineConfig } from "vitest/config";

// TEST_DATABASE_URL may live in .env: read it here, before any worker starts, so
// tests/setup.ts always sees it and points DATABASE_URL at the test branch.
if (!process.env.TEST_DATABASE_URL && existsSync(".env")) {
  const fromFile = parse(readFileSync(".env")).TEST_DATABASE_URL;
  if (fromFile) process.env.TEST_DATABASE_URL = fromFile;
}

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": root,
      // "server-only" throws outside Next's server bundles; tests run server code directly.
      "server-only": fileURLToPath(new URL("./tests/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    testTimeout: 60_000,
    // Integration files share one test database and the reset test empties it: run files one at a time then.
    fileParallelism: !process.env.TEST_DATABASE_URL,
  },
});
