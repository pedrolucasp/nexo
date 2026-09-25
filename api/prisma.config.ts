import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node scripts/seed-dev.mjs",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
