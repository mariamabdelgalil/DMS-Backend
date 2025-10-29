import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  saveDocumentMetadata,
  getWorkspaceDocuments,
} from "../services/document.service";

import DocumentModel from "../models/document.model";

export const uploadDocumentHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "no file uploaded" });
    }

    const { workspaceId } = req.body;
    const userNid = req.user?.userNid;

    if (!workspaceId) {
      return res
        .status(400)
        .json({ success: false, message: "workspace ID is required" });
    }

    const document = await saveDocumentMetadata(
      workspaceId,
      userNid,
      req.file.originalname,
      req.file.mimetype,
      req.file.path,
      req.file.size
    );

    res.status(201).json({ success: true, document });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const softDeleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;

    if (!userNid) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.userNid !== userNid) {
      return res.status(403).json({
        message: "Access denied. You can only delete your own documents.",
      });
    }

    document.isDeleted = true;
    await document.save();

    res.status(200).json({
      message: "Document soft-deleted successfully",
      document,
    });
  } catch (error: any) {
    console.error("Error soft deleting document:", error);
    res.status(500).json({
      message: "Error soft deleting document",
      error: error.message,
    });
  }
};

export const getWorkspaceDocumentsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const userNid = req.user?.userNid;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const documents = await getWorkspaceDocuments(workspaceId, userNid);

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
