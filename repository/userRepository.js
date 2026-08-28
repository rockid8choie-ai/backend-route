import prisma from "../prisma/client.js";

export const findMany = () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findById = (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const findByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const save = (data) => {
  return prisma.user.create({ data });
};

export const update = (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const remove = (id) => {
  return prisma.user.delete({
    where: { id },
  });
};
