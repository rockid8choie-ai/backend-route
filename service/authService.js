import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepository from "../repository/userRepository.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

function signToken(user) {
  return jwt.sign({ sub: String(user.id) }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

export const signup = async ({ name, email, password }) => {
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw createError("ConflictError", "이미 사용 중인 이메일입니다.");
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepository.save({ name, email, password: hashed });

  return { token: signToken(user), user: publicUser(user) };
};

export const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  const valid =
    user?.password && (await bcrypt.compare(password, user.password));

  if (!valid) {
    throw createError(
      "UnauthorizedError",
      "이메일 또는 비밀번호가 올바르지 않습니다.",
    );
  }

  return { token: signToken(user), user: publicUser(user) };
};

export const getMe = async (id) => {
  const user = await userRepository.findById(id);

  if (!user) {
    throw createError("NotFoundError", "회원을 찾을 수 없습니다.");
  }

  return publicUser(user);
};
