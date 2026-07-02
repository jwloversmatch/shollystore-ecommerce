import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;  
  images: string[];
  stock: number;
  isFeatured: boolean;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  images: { type: [String], default: [] },
  stock: { type: Number, required: true, default: 0 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

// ---------- Indexes ----------
ProductSchema.index({ name: 'text' });                // full‑text search (supports $text queries)
ProductSchema.index({ category: 1 });                 // filter by category
ProductSchema.index({ stock: 1 });                    // low‑stock filter
ProductSchema.index({ createdAt: -1 });               // newest products first

export const Product = mongoose.model<IProduct>('Product', ProductSchema);