import express from "express";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadDocumentHandler } from "../controllers/document.controller";
import {
  getWorkspaceDocumentsHandler,
  softDeleteDocument,
} from "../controllers/document.controller";

const router = express.Router();

// api/documents/upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocumentHandler
);

// api/documents/:id/soft-delete
router.put("/:id/soft-delete", authMiddleware, softDeleteDocument);

// api/documents/workspace/:workspaceId
router.get(
  "/workspace/:workspaceId",
  authMiddleware,
  getWorkspaceDocumentsHandler
);

export default router;
