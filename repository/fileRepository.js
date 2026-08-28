import prisma from "../prisma/client.js";

export const findMany = () => {
  return prisma.file.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });
};

export const save = (data) => {
  return prisma.file.create({ data });
};
