import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Not every Prisma command needs a database, so `prisma generate` works without this set.
    url: process.env.DATABASE_URL ?? "",
  },
});
