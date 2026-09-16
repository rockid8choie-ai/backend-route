import express from "express";
import * as workController from "../controllers/workController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.use(auth);

router
  .route("/")
  .get(workController.getWorks)
  .post(workController.createWork);

router
  .route("/:id")
  .get(workController.getWork)
  .patch(workController.updateStatus)
  .delete(workController.deleteWork);

export default router;
