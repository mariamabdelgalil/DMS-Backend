import fs from "fs";
import path from "path";
import sharp from "sharp";
import DocumentModel from "../models/document.model";

export const softDeleteDocumentService = async (
  id: string,
  userNid: string
) => {
  const document = await DocumentModel.findById(id);
  if (!document) throw new Error("Document not found");
  if (document.userNid !== userNid) throw new Error("Unauthorized");

  document.isDeleted = true;
  await document.save();
  return document;
};

export const restoreDocumentService = async (id: string, userNid: string) => {
  const document = await DocumentModel.findOne({
    _id: id,
    userNid,
    isDeleted: true,
  });
  if (!document) throw new Error("Document not found or not deleted");

  document.isDeleted = false;
  await document.save();
  return document;
};

export const permanentlyDeleteDocumentService = async (
  id: string,
  userNid: string
) => {
  const document = await DocumentModel.findOne({ _id: id, userNid });
  if (!document) throw new Error("Document not found");
  if (!document.isDeleted)
    throw new Error("Document must be soft-deleted first");

  const filePath = path.resolve(document.filePath);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await DocumentModel.deleteOne({ _id: id });
  return true;
};

export const getDeletedDocumentsService = async (userNid: string) => {
  return DocumentModel.find({ userNid, isDeleted: true });
};

export const getDocumentMetadataService = async (
  id: string,
  userNid: string
) => {
  const document = await DocumentModel.findById(id).select("-filePath");
  if (!document) throw new Error("Document not found");
  if (document.userNid !== userNid) throw new Error("Unauthorized");
  return document;
};

export const updateDocumentMetadataService = async (
  id: string,
  name: string,
  userNid: string
) => {
  const document = await DocumentModel.findById(id);
  if (!document) throw new Error("Document not found");
  if (document.userNid !== userNid) throw new Error("Unauthorized");

  document.name = name;
  await document.save();
  return document;
};

export const searchDocumentsService = async (
  workspaceId: string,
  query: string
) => {
  return DocumentModel.find({
    workspaceId,
    isDeleted: false,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { type: { $regex: query, $options: "i" } },
    ],
  }).sort({ uploadedAt: -1 });
};

export const downloadDocumentService = async (id: string, userNid: string) => {
  const document = await DocumentModel.findOne({
    _id: id,
    userNid,
    isDeleted: false,
  });
  if (!document) throw new Error("Document not found or unauthorized");

  const filePath = document.filePath;
  if (!fs.existsSync(filePath)) throw new Error("File not found on server");

  return { document, filePath };
};

export const viewDocumentService = async (id: string, userNid: string) => {
  const document = await DocumentModel.findById(id);
  if (!document) throw new Error("Document not found");
  if (document.userNid !== userNid) throw new Error("Unauthorized");

  const filePath = path.resolve(document.filePath);
  const fileData = fs.readFileSync(filePath);
  const base64String = `data:${document.type};base64,${fileData.toString(
    "base64"
  )}`;
  return { document, base64String };
};

export const previewDocumentService = async (id: string, userNid: string) => {
  const document = await DocumentModel.findById(id);
  if (!document) throw new Error("Document not found");
  if (document.userNid !== userNid) throw new Error("Unauthorized");

  if (!document.type.startsWith("image/")) return null;

  const filePath = path.resolve(document.filePath);
  if (!fs.existsSync(filePath)) throw new Error("File not found on server");

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
  return base64String;
};

export const saveDocumentMetadataService = async (
  workspaceId: string,
  userNid: string,
  name: string,
  type: string,
  filePath: string,
  size: number
) => {
  const document = await DocumentModel.create({
    workspaceId,
    userNid,
    name,
    type,
    filePath,
    size,
  });

  return document;
};

// with filtering and sorting
interface FilterOptions {
  type?: string;
  sort?: "recent" | "oldest" | "sizeAsc" | "sizeDesc";
}

export const getWorkspaceDocumentsService = async (
  workspaceId: string,
  userNid: string,
  filters: FilterOptions
) => {
  const query: any = {
    workspaceId,
    userNid,
    isDeleted: false,
  };

  // Filtering by type
  if (filters.type) {
    const typeMap: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    };

    const mimeType = typeMap[filters.type.toLowerCase()] || filters.type;
    query.type = mimeType;
  }

  // Sorting logic
  let sortQuery: any = {};
  switch (filters.sort) {
    case "recent":
      sortQuery = { uploadedAt: -1 };
      break;
    case "oldest":
      sortQuery = { uploadedAt: 1 };
      break;
    case "sizeAsc":
      sortQuery = { size: 1 };
      break;
    case "sizeDesc":
      sortQuery = { size: -1 };
      break;
    default:
      sortQuery = { uploadedAt: -1 };
  }

  const documents = await DocumentModel.find(query).sort(sortQuery);

  return documents;
};
