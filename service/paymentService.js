import { randomUUID } from "crypto";
import * as paymentRepository from "../repository/paymentRepository.js";
import * as workRepository from "../repository/workRepository.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

// 우선처리 비용 — 금액은 반드시 서버가 결정한다 (클라이언트 금액은 신뢰하지 않음)
export const FAST_TRACK_PRICE = 9_900;

// 토스 시크릿 키: env 우선, 없으면 공식 문서의 공개 샌드박스 키(실청구 불가)
const TOSS_SECRET_KEY =
  process.env.TOSS_SECRET_KEY ?? "test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R";

async function getOwnedWork(workId, userId) {
  const work = await workRepository.findById(workId);
  if (!work || work.userId !== userId) {
    throw createError("NotFoundError", "작업을 찾을 수 없습니다.");
  }
  return work;
}

// 결제 시작 — 주문 생성(멱등: pending 주문이 있으면 재사용)
export const checkout = async (workId, userId) => {
  const work = await getOwnedWork(workId, userId);

  if (work.fastTrack) {
    throw createError("ConflictPaidError", "이미 우선처리가 적용된 작업입니다.");
  }

  const existing = await paymentRepository.findPendingByWork(work.id, userId);
  const payment =
    existing ??
    (await paymentRepository.save({
      orderId: `work_${randomUUID().replace(/-/g, "")}`,
      amount: FAST_TRACK_PRICE,
      userId,
      workId: work.id,
    }));

  return {
    orderId: payment.orderId,
    amount: payment.amount,
    orderName: `우선처리 — ${work.title.slice(0, 40)}`,
    workId: work.id,
  };
};

// 결제 승인 — 토스 최종 승인 후 작업을 우선처리로 전환
export const confirm = async ({ orderId, paymentKey, amount }, userId) => {
  const payment = await paymentRepository.findByOrderId(orderId);
  if (!payment || payment.userId !== userId) {
    throw createError("NotFoundError", "주문을 찾을 수 없습니다.");
  }
  if (payment.status === "paid") {
    return { alreadyPaid: true, receiptUrl: payment.receiptUrl, workId: payment.workId };
  }
  if (payment.amount !== amount) {
    throw createError("ValidationError", "결제 금액이 주문과 다릅니다.");
  }

  const auth = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, paymentKey, amount }),
  });
  const confirmed = await res.json();

  if (!res.ok || Number(confirmed.totalAmount) !== amount) {
    await paymentRepository.update(payment.id, {
      status: "failed",
      failReason: confirmed?.message ?? "승인 실패",
    });
    throw createError(
      "PaymentConfirmError",
      confirmed?.message ?? "결제 승인에 실패했습니다. 다시 시도해 주세요.",
    );
  }

  const [updated] = await Promise.all([
    paymentRepository.update(payment.id, {
      status: "paid",
      paymentKey: confirmed.paymentKey,
      method: confirmed.method ?? null,
      receiptUrl: confirmed.receipt?.url ?? null,
      approvedAt: confirmed.approvedAt ? new Date(confirmed.approvedAt) : new Date(),
    }),
    paymentRepository.markWorkFastTrack(payment.workId),
  ]);

  return {
    alreadyPaid: false,
    amount: updated.amount,
    receiptUrl: updated.receiptUrl,
    workId: payment.workId,
  };
};
