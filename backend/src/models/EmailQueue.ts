import mongoose, { Schema, Document } from "mongoose";

export interface IEmailQueue extends Document {
  to: string;
  subject: string;
  html: string;
  text?: string;
  status: "pending" | "sent" | "failed";
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailQueueSchema = new Schema<IEmailQueue>(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true },
    text: { type: String },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastError: { type: String },
  },
  { timestamps: true }
);

EmailQueueSchema.index({ status: 1, attempts: 1, createdAt: 1 });

export const EmailQueue = mongoose.model<IEmailQueue>(
  "EmailQueue",
  EmailQueueSchema
);