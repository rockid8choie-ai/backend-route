import * as paymentService from "../service/paymentService.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const checkout = async (req, res, next) => {
  try {
    const workId = Number(req.body?.workId);
    if (!Number.isInteger(workId)) {
      throw createError("ValidationError", "작업 정보가 올바르지 않습니다.");
    }
    const order = await paymentService.checkout(workId, req.userId);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

export const confirm = async (req, res, next) => {
  try {
    const { orderId, paymentKey } = req.body ?? {};
    const amount = Number(req.body?.amount);
    if (!orderId || !paymentKey || !Number.isFinite(amount)) {
      throw createError("ValidationError", "결제 정보가 올바르지 않습니다.");
    }
    const result = await paymentService.confirm(
      { orderId: String(orderId), paymentKey: String(paymentKey), amount },
      req.userId,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};
