import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.route("/").get(userController.getUsers).post(userController.createUser);

router.get("/:userId/orders", (req, res) => {
  // TODO: 특정 회원의 주문 목록 조회
});

router
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
