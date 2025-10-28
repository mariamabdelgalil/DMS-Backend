import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { saveDocumentMetadata } from "../services/document.service";

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
