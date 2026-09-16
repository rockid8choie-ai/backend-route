import * as authService from "../service/authService.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !password) {
      throw createError("ValidationError", "이름·이메일·비밀번호는 필수입니다.");
    }
    if (!EMAIL_RE.test(email.trim())) {
      throw createError("ValidationError", "이메일 형식이 올바르지 않습니다.");
    }
    if (password.length < 6) {
      throw createError("ValidationError", "비밀번호는 6자 이상이어야 합니다.");
    }

    const result = await authService.signup({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email?.trim() || !password) {
      throw createError("ValidationError", "이메일과 비밀번호를 입력해 주세요.");
    }

    const result = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};
