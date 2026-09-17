import express from "express";
import * as paymentController from "../controllers/paymentController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.use(auth);

router.post("/checkout", paymentController.checkout);
router.post("/confirm", paymentController.confirm);

export default router;
