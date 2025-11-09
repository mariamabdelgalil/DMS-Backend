import Workspace from "../models/workspace.model";
import DocumentModel from "../models/document.model";
import fs from "fs";
import path from "path";

// create
export const createWorkspaceService = async (name: string, userNid: string) => {
  return await Workspace.create({ name, userNid });
};

// read
export const getUserWorkspacesService = async (userNid: string) => {
  return await Workspace.find({ userNid });
};

// update
export const updateWorkspaceService = async (
  id: string,
  userNid: string | undefined,
  data: { name?: string }
) => {
  const workspace = await Workspace.findOne({ _id: id, userNid });
  if (!workspace) throw new Error("Workspace not found or not authorized");

  return await Workspace.findByIdAndUpdate(id, data, { new: true });
};

// delete
export const deleteWorkspaceService = async (
  id: string,
  userNid: string | undefined
) => {
  const workspace = await Workspace.findOne({ _id: id, userNid });
  if (!workspace) throw new Error("Workspace not found or not authorized");

  // Get all documents before deletion to remove files
  const documents = await DocumentModel.find({ workspaceId: id, userNid });

  // Delete workspace from DB
  await Workspace.findByIdAndDelete(id);

  // Delete all documents from DB
  await DocumentModel.deleteMany({ workspaceId: id, userNid });

  // Delete files physically from storage
  documents.forEach((doc) => {
    if (doc.filePath) {
      try {
        const filePath = path.resolve(doc.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  });

  return { success: true, message: "Workspace and all its documents deleted" };
};
