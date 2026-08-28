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

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 1,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
