import express from "express";
import upload from "../middlewares/upload.js";
import * as fileController from "../controllers/fileController.js";

const router = express.Router();

router.get("/", fileController.getFiles);
router.post("/", upload.single("image"), fileController.uploadFile);

export default router;
