import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  isActive: boolean;
  unsubscribedAt?: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    unsubscribedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model<INewsletterSubscriber>(
  "NewsletterSubscriber",
  newsletterSubscriberSchema
);