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
