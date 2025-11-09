import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  saveDocumentMetadata,
  getWorkspaceDocuments,
} from "../services/document.service";
import path from "path";
import fs from "fs";
import sharp from "sharp";
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
    const { type, sort } = req.query;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const filters = {
      type: type as string | undefined,
      sort: sort as "recent" | "oldest" | "sizeAsc" | "sizeDesc" | undefined,
    };

    const documents = await getWorkspaceDocuments(
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

export const getDocumentMetadata = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;

    const document = await DocumentModel.findById(id).select("-filePath");

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (document.userNid !== userNid) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error while retrieving metadata." });
  }
};

export const updateDocumentMetadata = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userNid = req.user?.userNid;

    if (!name) {
      return res.status(400).json({ message: "Document name is required." });
    }

    const document = await DocumentModel.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (document.userNid !== userNid) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this document." });
    }

    document.name = name;
    await document.save();

    res.status(200).json({
      message: "Document name updated successfully.",
      document,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating metadata." });
  }
};

export const searchDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId, query } = req.query as {
      workspaceId: string;
      query: string;
    };

    if (!workspaceId || !query) {
      return res
        .status(400)
        .json({ message: "workspaceId and query are required" });
    }

    const documents = await DocumentModel.find({
      workspaceId,
      isDeleted: false,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
      ],
    }).sort({ uploadedAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error searching documents:", error);
    res.status(500).json({ message: "Error searching documents" });
  }
};

export const downloadDocumentHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;

    const document = await DocumentModel.findOne({
      _id: id,
      userNid,
      isDeleted: false,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or unauthorized",
      });
    }

    const filePath = document.filePath;

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found on server" });
    }

    res.setHeader("Content-Type", document.type);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(document.name)}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const viewDocumentHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (document.userNid !== userNid) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    const filePath = path.resolve(document.filePath);
    const fileData = fs.readFileSync(filePath);

    const base64String = `data:${document.type};base64,${fileData.toString(
      "base64"
    )}`;

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

export const test = async (req: AuthRequest, res: Response) => {
  res.status(200).json({ message: "Test doc" });
};

export const previewDocumentHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;

    const document = await DocumentModel.findById(id);
    if (!document) {
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });
    }

    if (document.userNid !== userNid) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized access" });
    }

    if (!document.type.startsWith("image/")) {
      return res.status(200).json({ success: true, preview: null });
    }

    const filePath = path.resolve(document.filePath);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ success: false, message: "File not found on server" });
    }

    const fileBuffer = fs.readFileSync(filePath);

    let sharpInstance = sharp(fileBuffer).resize({
      width: 200,
      withoutEnlargement: true,
    });

    if (document.type === "image/jpeg" || document.type === "image/jpg") {
      sharpInstance = sharpInstance.jpeg({
        quality: 70,
        mozjpeg: true,
        chromaSubsampling: "4:2:0",
      });
    } else if (document.type === "image/png") {
      sharpInstance = sharpInstance.png({
        compressionLevel: 8,
        adaptiveFiltering: true,
        palette: true,
      });
    }

    const previewBuffer = await sharpInstance.toBuffer();
    const base64String = `data:${document.type};base64,${previewBuffer.toString(
      "base64"
    )}`;

    return res.status(200).json({
      success: true,
      preview: base64String,
    });
  } catch (error) {
    console.error("Error generating document preview:", error);
    return res.status(500).json({
      success: false,
      message: "Error generating preview",
    });
  }
};

//restore soft deleted document
export const restoreDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const document = await DocumentModel.findOne({
      _id: id,
      userNid,
      isDeleted: true,
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or not deleted" });
    }

    document.isDeleted = false;
    await document.save();

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
    const { id } = req.params;
    const userNid = req.user?.userNid;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const document = await DocumentModel.findOne({ _id: id, userNid });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!document.isDeleted) {
      return res
        .status(400)
        .json({ message: "Document must be soft-deleted first" });
    }

    // Delete file from storage
    const filePath = path.resolve(document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from database
    await DocumentModel.deleteOne({ _id: id });

    res
      .status(200)
      .json({ success: true, message: "Document permanently deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeletedDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userNid = req.user?.userNid;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const docs = await DocumentModel.find({ userNid, isDeleted: true });

    res.status(200).json({ success: true, documents: docs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
