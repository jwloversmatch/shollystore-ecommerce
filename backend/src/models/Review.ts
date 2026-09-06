import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 500 },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Prevent duplicate reviews by the same user for the same product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Efficiently retrieve recent unique reviews per user
ReviewSchema.index({ user: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);