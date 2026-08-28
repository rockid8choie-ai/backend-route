import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export function normalizeDatabaseUrl(value) {
  if (!value) {
    return "";
  }

  let url = value.trim();
  url = url.replace(/^DATABASE_URL\s*=\s*/i, "");
  url = url.replace(/^["']|["']$/g, "");
  return url.trim();
}

export function parseDatabaseUrl(databaseUrl) {
  const parsed = new URL(
    databaseUrl.replace(/^postgresql:/, "http:").replace(/^postgres:/, "http:"),
  );

  return {
    host: decodeURIComponent(parsed.hostname),
    port: Number(parsed.port || 5432),
    database: decodeURIComponent(parsed.pathname.replace(/^\//, "") || "postgres"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const parsed = parseDatabaseUrl(databaseUrl);

const pool = new pg.Pool({
  host: parsed.host,
  port: parsed.port,
  database: parsed.database,
  user: parsed.user,
  password: parsed.password,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
