import Workspace from "../models/workspace.model";
import DocumentModel from "../models/document.model";
import fs from "fs";
import path from "path";

// create
export const createWorkspace = async (name: string, userNid: string) => {
  return await Workspace.create({ name, userNid });
};

// read
export const getUserWorkspaces = async (userNid: string) => {
  return await Workspace.find({ userNid });
};

// update
export const updateWorkspace = async (
  id: string,
  userNid: string | undefined,
  data: { name?: string }
) => {
  // 3shan at2aked en el user elly 3ayz y3ml update howa nafs el user elly 3amel el workspace
  const workspace = await Workspace.findOne({ _id: id, userNid });
  if (!workspace) throw new Error("Workspace not found or not authorized");

  return await Workspace.findByIdAndUpdate(id, data, { new: true });
};

// delete
// export const deleteWorkspace = async (
//   id: string,
//   userNid: string | undefined
// ) => {
//   const workspace = await Workspace.findOne({ _id: id, userNid });
//   if (!workspace) throw new Error("Workspace not found or not authorized");
//   await Workspace.findByIdAndDelete(id);

//   //cascade delete documents
//   await DocumentModel.deleteMany({
//     workspaceId: id,
//     userNid,
//   });

//   return { success: true };
// };

export const deleteWorkspace = async (
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
