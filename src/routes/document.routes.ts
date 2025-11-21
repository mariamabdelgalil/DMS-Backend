import express from "express";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  uploadDocumentHandler,
  getWorkspaceDocumentsHandler,
  softDeleteDocument,
  searchDocuments,
  downloadDocumentHandler,
  updateDocumentMetadata,
  getDocumentMetadata,
  viewDocumentHandler,
  previewDocumentHandler,
  restoreDocument,
  permanentlyDeleteDocument,
  getDeletedDocuments,
  test,
} from "../controllers/document.controller";

const router = express.Router();

// api/documents/upload
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDocumentHandler
);

// api/documents/search
router.get("/search", authMiddleware, searchDocuments);

// api/documents/workspace/:workspaceId
router.get(
  "/workspace/:workspaceId",
  authMiddleware,
  getWorkspaceDocumentsHandler
);

//GET api/documents/:id/view
router.get("/:id/view", authMiddleware, viewDocumentHandler);

//GET api/documents/:id/preview
router.get("/:id/preview", authMiddleware, previewDocumentHandler);

router.get("/test/test", test);

// api/documents/:id/restore
router.put("/:id/restore", authMiddleware, restoreDocument);

// api/documents/:id/permanent-delete
router.delete(
  "/:id/permanent-delete",
  authMiddleware,
  permanentlyDeleteDocument
);

// api/documents/:id/soft-delete
router.put("/:id/soft-delete", authMiddleware, softDeleteDocument);

// api/documents/deleted/all
router.get("/deleted/all", authMiddleware, getDeletedDocuments);

// api/documents/:id/download
router.get("/:id/download", authMiddleware, downloadDocumentHandler);

//GET api/documents/:id/metadata
router.get("/:id/metadata", authMiddleware, getDocumentMetadata);

//PUT api/documents/:id/metadata
router.put("/:id/metadata", authMiddleware, updateDocumentMetadata);

export default router;
