import { Response } from "express";
import prisma from "../prisma/client";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userNid = req.user?.userNid;

    if (!userNid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { nid: userNid },
      select: {
        name: true,
        email: true,
        nid: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserName = async (req: AuthRequest, res: Response) => {
  try {
    const userNid = req.user?.userNid;
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { nid: userNid },
      data: { name },
      select: { id: true, name: true, email: true, nid: true }, // return safe data
    });

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating name:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error updating user name" });
  }
};
