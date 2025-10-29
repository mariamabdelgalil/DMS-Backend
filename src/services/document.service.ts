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

export const getWorkspaceDocuments = async (
  workspaceId: string,
  userNid: string
) => {
  const documents = await DocumentModel.find({
    workspaceId,
    userNid,
    isDeleted: false,
  });

  return documents;
};
