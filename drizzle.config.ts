import type { Config } from "drizzle-kit";

export default {
  schema: "./src/main/db/schema.ts",
  out: "./src/main/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./dev-data/kenverse.db",
  },
  verbose: true,
  strict: true,
} satisfies Config;
