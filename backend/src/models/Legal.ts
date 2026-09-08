import mongoose, { Document, Schema } from "mongoose";

export type LegalPageSlug = "privacy" | "terms" | "returns";

export interface ILegalPage extends Document {
  slug: LegalPageSlug;
  title: string;
  content: string; 
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LegalPageSchema: Schema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      enum: ["privacy", "terms", "returns"],
    },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

export const LegalPage = mongoose.model<ILegalPage>("LegalPage", LegalPageSchema);