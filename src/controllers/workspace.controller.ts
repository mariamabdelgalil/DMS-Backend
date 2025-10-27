import { Request, Response } from "express";
import {
  createWorkspace,
  getUserWorkspaces,
  updateWorkspace,
  deleteWorkspace,
} from "../services/workspace.service";

interface AuthRequest extends Request {
  user?: { userNid: string };
}

export const createWorkspaceHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name } = req.body;

    const userNid = req.user?.userNid;

    if (!userNid) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Missing user NID" });
    }

    const workspace = await createWorkspace(name, userNid);
    res.status(201).json({ success: true, workspace });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getUserWorkspacesHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { userNid } = req.params;
    if (req.user?.userNid !== userNid) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Access denied" });
    }
    const workspaces = await getUserWorkspaces(userNid);
    res.status(200).json({ success: true, workspaces });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateWorkspaceHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;
    const workspace = await updateWorkspace(id, userNid, req.body);
    res.status(200).json({ success: true, workspace });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteWorkspaceHandler = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userNid = req.user?.userNid;
    await deleteWorkspace(id, userNid);
    res.status(200).json({ success: true, message: "Workspace deleted" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
