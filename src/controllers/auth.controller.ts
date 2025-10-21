import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, nid } = req.body;
    const { user, token } = await registerUser(name, email, password, nid);
    res.status(201).json({ success: true, user, token });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ success: true, user, token });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
