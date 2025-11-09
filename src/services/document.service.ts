import DocumentModel from "../models/document.model";

export const saveDocumentMetadata = async (
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

export const getWorkspaceDocuments = async (
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
