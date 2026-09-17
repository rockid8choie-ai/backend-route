import prisma from "../prisma/client.js";

export const findByOrderId = (orderId) => {
  return prisma.payment.findUnique({
    where: { orderId },
  });
};

export const findPendingByWork = (workId, userId) => {
  return prisma.payment.findFirst({
    where: { workId, userId, status: "pending" },
  });
};

export const save = (data) => {
  return prisma.payment.create({ data });
};

export const update = (id, data) => {
  return prisma.payment.update({
    where: { id },
    data,
  });
};

export const markWorkFastTrack = (workId) => {
  return prisma.work.update({
    where: { id: workId },
    data: { fastTrack: true },
  });
};
