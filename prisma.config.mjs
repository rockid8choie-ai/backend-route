import path from "node:path";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const databaseUrl = env("DATABASE_URL");
const sqlitePath = path.resolve(databaseUrl.replace(/^file:/, ""));
const studioUrl = `file://${sqlitePath}`;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: studioUrl,
  },
});
