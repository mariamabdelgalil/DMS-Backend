import Workspace from "../models/workspace.model";

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
export const deleteWorkspace = async (
  id: string,
  userNid: string | undefined
) => {
  const workspace = await Workspace.findOne({ _id: id, userNid });
  if (!workspace) throw new Error("Workspace not found or not authorized");
  return await Workspace.findByIdAndDelete(id);
};
