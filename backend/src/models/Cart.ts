import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  qty: number;
  price: number;
  variant?: {
    sku?: string;
    color?: string;
    size?: string;
  };
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  emailSent: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        variant: {
          sku: { type: String },
          color: { type: String },
          size: { type: String },
        },
      },
    ],
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CartSchema.index({ updatedAt: 1, emailSent: 1 });

export const Cart = mongoose.model<ICart>("Cart", CartSchema);