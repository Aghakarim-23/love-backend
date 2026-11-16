import express from "express";
import {
  getMemories,
  createMemory,
  deleteMemory,
} from "../controllers/memoryController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadSingleImage } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect, getMemories);
router.post("/", protect, uploadSingleImage, createMemory);
router.delete("/:id", protect, deleteMemory);

export default router;
