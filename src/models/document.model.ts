import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  workspaceId: mongoose.Types.ObjectId;
  userNid: string;
  name: string;
  type: string;
  filePath: string;
  size: number;
  uploadedAt: Date;
  isDeleted: boolean;
}

const documentSchema = new Schema<IDocument>({
  workspaceId: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  userNid: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  filePath: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

export default mongoose.model<IDocument>("Document", documentSchema);
