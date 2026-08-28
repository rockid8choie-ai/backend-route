import * as userRepository from "../repository/userRepository.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const getUsers = async () => {
  return userRepository.findMany();
};

export const getUser = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw createError("NotFoundError", "회원을 찾을 수 없습니다.");
  }

  return user;
};

export const createUser = async ({ name, email }) => {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw createError("ConflictError", "이미 사용 중인 이메일입니다.");
  }

  return userRepository.save({ name, email });
};

export const updateUser = async (id, { name, email }) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw createError("NotFoundError", "회원을 찾을 수 없습니다.");
  }

  return userRepository.update(id, { name, email });
};

export const deleteUser = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw createError("NotFoundError", "회원을 찾을 수 없습니다.");
  }

  await userRepository.remove(id);
};
