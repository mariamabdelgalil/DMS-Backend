import { Router } from "express";
import {
  createWorkspaceHandler,
  getUserWorkspacesHandler,
  updateWorkspaceHandler,
  deleteWorkspaceHandler,
} from "../controllers/workspace.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createWorkspaceHandler);
router.get("/:userNid", authMiddleware, getUserWorkspacesHandler);
router.put("/:id", authMiddleware, updateWorkspaceHandler);
router.delete("/:id", authMiddleware, deleteWorkspaceHandler);

export default router;
