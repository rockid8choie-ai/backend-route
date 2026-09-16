import prisma from "../prisma/client.js";

export const findManyByUser = (userId) => {
  return prisma.work.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const findById = (id) => {
  return prisma.work.findUnique({
    where: { id },
  });
};

export const save = (data) => {
  return prisma.work.create({ data });
};

export const update = (id, data) => {
  return prisma.work.update({
    where: { id },
    data,
  });
};

export const remove = (id) => {
  return prisma.work.delete({
    where: { id },
  });
};
