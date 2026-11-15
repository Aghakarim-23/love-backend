import express from "express";
import { getAllUsers, getUserById, getMe } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// "/me" must come before "/:id", otherwise "me" is treated as an id
router.get("/me", protect, getMe);
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);

export default router;
