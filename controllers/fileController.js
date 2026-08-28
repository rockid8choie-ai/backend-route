import * as fileService from "../service/fileService.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const getFiles = async (req, res, next) => {
  try {
    const files = await fileService.getFiles();
    res.json(files);
  } catch (error) {
    next(error);
  }
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError("FileRequiredError", "파일이 필요합니다.");
    }

    console.log(req.file);

    const file = await fileService.saveFile(req.file);
    res.status(201).json(file);
  } catch (error) {
    next(error);
  }
};
