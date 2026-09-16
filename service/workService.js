import * as workRepository from "../repository/workRepository.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const STATUS = ["접수", "배정", "완료"];
export const CATEGORIES = ["elec", "plumb", "hvac", "clean", "etc"];
export const PRIORITIES = ["보통", "긴급"];

// 본인 작업만 조회/수정 가능 — 남의 작업은 존재 자체를 숨긴다(404)
async function getOwned(id, userId) {
  const work = await workRepository.findById(id);

  if (!work || work.userId !== userId) {
    throw createError("NotFoundError", "작업을 찾을 수 없습니다.");
  }

  return work;
}

export const listWorks = (userId) => {
  return workRepository.findManyByUser(userId);
};

export const getWork = (id, userId) => {
  return getOwned(id, userId);
};

export const createWork = (userId, { title, category, location, priority, desc }) => {
  return workRepository.save({
    title,
    category,
    location,
    priority,
    desc: desc ?? "",
    userId,
  });
};

export const updateStatus = async (id, userId, status) => {
  await getOwned(id, userId);
  return workRepository.update(id, { status });
};

export const removeWork = async (id, userId) => {
  await getOwned(id, userId);
  await workRepository.remove(id);
};
