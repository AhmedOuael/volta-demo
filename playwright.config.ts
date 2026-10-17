import { existsSync, readFileSync } from "node:fs";
import { parse } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

// Browser tests against a production build (`npm run test:e2e` builds first).
// They place real orders, so the server always runs on TEST_DATABASE_URL (a Neon
// branch seeded with `npm run db:seed-demo`), never the live demo database.
// Uses the installed Google Chrome (no download).
const PORT = 3100;

const fileEnv = existsSync(".env") ? parse(readFileSync(".env")) : {};
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? fileEnv.TEST_DATABASE_URL;
if (!testDatabaseUrl) throw new Error("Set TEST_DATABASE_URL (a Neon branch) to run the browser tests.");
if (testDatabaseUrl === fileEnv.DATABASE_URL) throw new Error("TEST_DATABASE_URL is the live database. Point it at a Neon branch instead.");

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  retries: 0,
  workers: 1, // one shared test database
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, channel: "chrome", trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "phone", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_URL: testDatabaseUrl,
      DATABASE_URL_POOLED: testDatabaseUrl,
      DEMO_MODE: "true",
      STORE_WHATSAPP: "213555000000",
    },
  },
});
