import express from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  res.json({ message: "Welcome to your profile!" });
});

export default router;
