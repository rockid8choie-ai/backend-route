import express from "express";
import * as aiController from "../controllers/aiController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/classify", auth, aiController.classify);

export default router;
