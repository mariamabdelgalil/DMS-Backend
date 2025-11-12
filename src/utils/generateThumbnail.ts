import sharp from "sharp";
import path from "path";
import fs from "fs";

export const generateThumbnail = async (
  originalPath: string,
  documentId: string,
  mimeType: string
) => {
  const thumbnailsDir = path.join(__dirname, "../thumbnails");
  if (!fs.existsSync(thumbnailsDir))
    fs.mkdirSync(thumbnailsDir, { recursive: true });

  const outputPath = path.join(thumbnailsDir, `${documentId}.jpg`);

  let sharpInstance = sharp(originalPath).resize({
    width: 200,
    withoutEnlargement: true,
  });

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    sharpInstance = sharpInstance.jpeg({ quality: 70, mozjpeg: true });
  } else if (mimeType === "image/png") {
    sharpInstance = sharpInstance.png({ compressionLevel: 8, palette: true });
  } else {
    // Not an image, skip thumbnail creation
    return null;
  }

  await sharpInstance.toFile(outputPath);
  return outputPath;
};
