import * as userService from "../service/userService.js";

function createError(name, message) {
  const error = new Error(message);
  error.name = name;
  return error;
}

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUser(id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      throw createError("ValidationError", "이름과 이메일은 필수입니다.");
    }

    const user = await userService.createUser({ name, email });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;
    const user = await userService.updateUser(id, { name, email });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
