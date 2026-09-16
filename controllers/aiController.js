import * as aiService from "../service/aiService.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const classify = async (req, res, next) => {
  try {
    const { title, desc } = req.body ?? {};

    if (!title?.trim() || title.trim().length < 5) {
      throw createError(
        "ValidationError",
        "AI 분류를 위해 제목을 5자 이상 입력해 주세요.",
      );
    }

    const result = await aiService.classifyWork({
      title: title.trim().slice(0, 200),
      desc: desc?.trim().slice(0, 1000) ?? "",
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
