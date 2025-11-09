import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  nid: string
) => {
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error("Email already exists");
  const existingNid = await prisma.user.findUnique({ where: { nid } });
  if (existingNid) throw new Error("National ID already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, nid },
  });

  const token = jwt.sign({ userNid: user.nid }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid credentials");

  const token = jwt.sign({ userNid: user.nid }, JWT_SECRET, {
    expiresIn: "1h",
  });

  return { user, token };
};
