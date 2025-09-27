import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: `${Bun.env.DATABASE_URL}`,
  },
  dialect: "sqlite",
  schema: "./src/db/**/schema.ts",
  out: "./drizzle",
});
