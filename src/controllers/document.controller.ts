import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  softDeleteDocumentService,
  restoreDocumentService,
  permanentlyDeleteDocumentService,
  getDeletedDocumentsService,
  getDocumentMetadataService,
  updateDocumentMetadataService,
  searchDocumentsService,
  downloadDocumentService,
  viewDocumentService,
  previewDocumentService,
  saveDocumentMetadataService,
  getWorkspaceDocumentsService,
} from "../services/document.service";
import fs from "fs";

export const softDeleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const document = await softDeleteDocumentService(
      req.params.id,
      req.user?.userNid!
    );
    res.status(200).json({
      success: true,
      message: "Document soft-deleted successfully",
      document,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreDocument = async (req: AuthRequest, res: Response) => {
  try {
    await restoreDocumentService(req.params.id, req.user?.userNid!);
    res.status(200).json({ success: true, message: "Document restored" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const permanentlyDeleteDocument = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await permanentlyDeleteDocumentService(req.params.id, req.user?.userNid!);
    res
      .status(200)
      .json({ success: true, message: "Document permanently deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeletedDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const documents = await getDeletedDocumentsService(req.user?.userNid!);
    res.status(200).json({ success: true, documents });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentMetadata = async (req: AuthRequest, res: Response) => {
  try {
    const document = await getDocumentMetadataService(
      req.params.id,
      req.user?.userNid!
    );
    res.status(200).json({ document });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocumentMetadata = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const document = await updateDocumentMetadataService(
      req.params.id,
      req.body.name,
      req.user?.userNid!
    );
    res
      .status(200)
      .json({ message: "Document name updated successfully", document });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const searchDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, query } = req.query as {
      workspaceId: string;
      query: string;
    };
    if (!workspaceId || !query)
      return res
        .status(400)
        .json({ message: "workspaceId and query are required" });

    const documents = await searchDocumentsService(workspaceId, query);
    res.status(200).json(documents);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadDocumentHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { document, filePath } = await downloadDocumentService(
      req.params.id,
      req.user?.userNid!
    );
    res.setHeader("Content-Type", document.type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${document.name}"`
    );
    fs.createReadStream(filePath).pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const viewDocumentHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { document, base64String } = await viewDocumentService(
      req.params.id,
      req.user?.userNid!
    );
    res.status(200).json({
      success: true,
      name: document.name,
      type: document.type,
      data: base64String,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const previewDocumentHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const base64String = await previewDocumentService(
      req.params.id,
      req.user?.userNid!
    );
    res.status(200).json({ success: true, preview: base64String });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocumentHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const { workspaceId } = req.body;
    const userNid = req.user?.userNid;

    if (!workspaceId) {
      return res
        .status(400)
        .json({ success: false, message: "Workspace ID is required" });
    }

    const document = await saveDocumentMetadataService(
      workspaceId,
      userNid!,
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

export const getWorkspaceDocumentsHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { workspaceId } = req.params;
    const userNid = req.user?.userNid;
    const { type, sort } = req.query;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filters = {
      type: type as string | undefined,
      sort: sort as "recent" | "oldest" | "sizeAsc" | "sizeDesc" | undefined,
    };

    const documents = await getWorkspaceDocumentsService(
      workspaceId,
      userNid,
      filters
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const test = async (_req: AuthRequest, res: Response) => {
  res.status(200).json({ message: "Test doc" });
};
