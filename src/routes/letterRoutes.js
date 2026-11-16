import express from "express";
import { getLetters, createLetter } from "../controllers/letterController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getLetters);
router.post("/", protect, createLetter);

export default router;
