import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // Client generation and schema validation do not connect to this fallback.
    url: process.env.DATABASE_URL ?? "mysql://unused:unused@127.0.0.1:3306/blog"
  }
});
