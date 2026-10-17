import { readFileSync, existsSync } from "node:fs";
import { parse } from "dotenv";

// Integration tests write orders, customers and products. They only ever run
// against TEST_DATABASE_URL (e.g. a Neon branch), never the live database.
const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl) {
  const live = [".env", ".env.local"]
    .filter((f) => existsSync(f))
    .map((f) => parse(readFileSync(f)).DATABASE_URL)
    .filter(Boolean);
  if (live.includes(testUrl)) {
    throw new Error("TEST_DATABASE_URL is the live database. Point it at a Neon branch instead.");
  }
  // Set before lib/prisma is imported; dotenv never overrides an existing value.
  process.env.DATABASE_URL = testUrl;
} else {
  // No test branch: make any accidental database access fail instead of reaching the live DB.
  process.env.DATABASE_URL = "postgresql://no-test-database.invalid/none";
}
