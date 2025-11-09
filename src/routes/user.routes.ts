import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { updateUserName } from "../controllers/user.controller";
import { getUserProfile } from "../controllers/user.controller";

const router = express.Router();

router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile/update-name", authMiddleware, updateUserName);

export default router;
