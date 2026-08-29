import mongoose, { Document, Schema } from "mongoose";

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model<IContactMessage>(
  "ContactMessage",
  ContactMessageSchema
);