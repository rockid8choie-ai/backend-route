import * as fileRepository from "../repository/fileRepository.js";

export const getFiles = async () => {
  const files = await fileRepository.findMany();

  return files.map((file) => ({
    ...file,
    url: `/files/${file.storedName}`,
  }));
};

export const saveFile = async (file) => {
  const saved = await fileRepository.save({
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
  });

  return {
    ...saved,
    url: `/files/${saved.storedName}`,
  };
};
