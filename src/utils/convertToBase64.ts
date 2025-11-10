import fs from "fs";
import path from "path";

export const convertToBase64 = (filePath: string): string | null => {
  try {
    const absolutePath = path.resolve(filePath);
    if (!fs.existsSync(absolutePath)) return null;
    const fileBuffer = fs.readFileSync(absolutePath);
    return `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;
  } catch {
    return null;
  }
};
