import * as workService from "../service/workService.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const getWorks = async (req, res, next) => {
  try {
    const works = await workService.listWorks(req.userId);
    res.json(works);
  } catch (error) {
    next(error);
  }
};

export const getWork = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const work = await workService.getWork(id, req.userId);
    res.json(work);
  } catch (error) {
    next(error);
  }
};

export const createWork = async (req, res, next) => {
  try {
    const { title, category, location, priority, desc } = req.body ?? {};

    if (!title?.trim() || title.trim().length < 5) {
      throw createError("ValidationError", "제목은 5자 이상 입력해 주세요.");
    }
    if (!location?.trim()) {
      throw createError("ValidationError", "위치를 입력해 주세요.");
    }
    if (!workService.CATEGORIES.includes(category)) {
      throw createError("ValidationError", "분류 값이 올바르지 않습니다.");
    }
    if (!workService.PRIORITIES.includes(priority)) {
      throw createError("ValidationError", "우선순위 값이 올바르지 않습니다.");
    }

    const work = await workService.createWork(req.userId, {
      title: title.trim(),
      category,
      location: location.trim(),
      priority,
      desc: desc?.trim() ?? "",
    });
    res.status(201).json(work);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!workService.STATUS.includes(status)) {
      throw createError("ValidationError", "상태 값이 올바르지 않습니다.");
    }

    const work = await workService.updateStatus(id, req.userId, status);
    res.json(work);
  } catch (error) {
    next(error);
  }
};

export const deleteWork = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await workService.removeWork(id, req.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
