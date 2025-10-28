import express from "express";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadDocumentHandler } from "../controllers/document.controller";

const router = express.Router();

// api/documents/upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocumentHandler
);

export default router;
