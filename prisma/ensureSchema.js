// 서버 시작(콜드 스타트) 시 1회 실행되는 멱등 스키마 보정.
// 로컬에서 DATABASE_URL(Vercel sensitive env)을 받을 수 없어 prisma db push를
// 돌릴 수 없기 때문에, schema.prisma와 동일한 DDL을 IF NOT EXISTS로 적용한다.
// 외부에서 호출할 수 있는 API가 아니며, 실행 SQL은 아래 고정 목록뿐이다.
import prisma from "./client.js";

const DDL = [
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT`,
  `CREATE TABLE IF NOT EXISTS "Work" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT '보통',
    "status" TEXT NOT NULL DEFAULT '접수',
    "desc" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Work_userId_fkey" FOREIGN KEY ("userId")
      REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Work_userId_idx" ON "Work"("userId")`,
  `ALTER TABLE "Work" ADD COLUMN IF NOT EXISTS "fastTrack" BOOLEAN NOT NULL DEFAULT FALSE`,
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id" SERIAL PRIMARY KEY,
    "orderId" TEXT NOT NULL UNIQUE,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentKey" TEXT,
    "method" TEXT,
    "receiptUrl" TEXT,
    "failReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "workId" INTEGER NOT NULL,
    CONSTRAINT "Payment_workId_fkey" FOREIGN KEY ("workId")
      REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId")`,
];

let ensured = null;

export default function ensureSchema() {
  if (!ensured) {
    ensured = (async () => {
      for (const sql of DDL) {
        await prisma.$executeRawUnsafe(sql);
      }
    })().catch((error) => {
      ensured = null; // 실패 시 다음 요청에서 재시도
      console.error("ensureSchema failed:", error.message);
      throw error;
    });
  }
  return ensured;
}
