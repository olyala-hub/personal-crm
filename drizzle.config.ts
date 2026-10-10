import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

import { getDatabaseUrl } from "./src/db/connection-url";

// Load .env the same way Next.js does, so the CLI and the app share settings.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(),
  },
  strict: true,
  verbose: true,
});
