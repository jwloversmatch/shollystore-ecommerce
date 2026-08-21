import mongoose, { Document, Schema } from "mongoose";
import { sendLowStockAdminEmail, sendOutOfStockAdminEmail } from "../services/email.service";

// ─── Variant sub‑schema ────────────────────────────────────────
export interface IVariant {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}

const VariantSchema = new Schema<IVariant>(
  {
    sku: { type: String },
    color: { type: String },
    size: { type: String },
    price: { type: Number },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number },
    images: { type: [String] },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
);

// ─── Shipping info ─────────────────────────────────────────────
export interface IShippingInfo {
  weight?: number;
  weightUnit?: "kg" | "g" | "lb" | "oz";
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: "cm" | "in";
  };
  shippingClass?: string;
  freeShipping?: boolean;
}

const ShippingInfoSchema = new Schema<IShippingInfo>(
  {
    weight: { type: Number },
    weightUnit: { type: String, enum: ["kg", "g", "lb", "oz"] },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, enum: ["cm", "in"] },
    },
    shippingClass: { type: String },
    freeShipping: { type: Boolean, default: false },
  },
  { _id: false },
);

// ─── SEO info ──────────────────────────────────────────────────
export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

const SEOSchema = new Schema<ISEO>(
  {
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    ogImage: { type: String },
  },
  { _id: false },
);

// ─── Main Product interface ────────────────────────────────────
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  lowStockNotified: boolean;
  outOfStockNotified: boolean;
  isFeatured: boolean;

  sku?: string;
  barcode?: string;
  brand?: string;
  tags?: string[];
  discount?: {
    percentage: number;
    validUntil?: Date;
  };

  // flexible attributes & variants
  attributes?: Record<string, string | number | boolean>;
  variants?: IVariant[];

  // product type flags
  isActive?: boolean;
  isDigital?: boolean;
  isGiftCard?: boolean;
  preOrder?: boolean;

  // inventory policies
  inventoryPolicy?: "deny" | "continue";
  minOrderQuantity?: number;
  maxOrderQuantity?: number;

  // tax
  taxable?: boolean;
  taxClass?: string;

  // media
  videoUrl?: string;
  downloadUrl?: string;

  // shipping
  shippingInfo?: IShippingInfo;
  returnPolicy?: string;

  // marketing & SEO
  seo?: ISEO;
  relatedProducts?: mongoose.Types.ObjectId[];
  averageRating?: number;
  numberOfReviews?: number;

  // scheduling
  publishedAt?: Date;

  // extra flexible fields
  customFields?: { key: string; value: string }[];
  createdAt: Date;
  updatedAt: Date;

  checkLowStockAndNotify(): Promise<void>;
}

// ─── Product schema ────────────────────────────────────────────
const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    lowStockNotified: { type: Boolean, default: false },
    outOfStockNotified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String },
    brand: { type: String },
    tags: { type: [String] },
    discount: {
      percentage: { type: Number, min: 0, max: 100 },
      validUntil: { type: Date },
    },
    attributes: { type: Map, of: Schema.Types.Mixed },
    variants: { type: [VariantSchema], default: [] },

    isActive: { type: Boolean, default: true },
    isDigital: { type: Boolean, default: false },
    isGiftCard: { type: Boolean, default: false },
    preOrder: { type: Boolean, default: false },

    inventoryPolicy: {
      type: String,
      enum: ["deny", "continue"],
      default: "deny",
    },
    minOrderQuantity: { type: Number, default: 1 },
    maxOrderQuantity: { type: Number },

    taxable: { type: Boolean, default: true },
    taxClass: { type: String, default: "standard" },

    videoUrl: { type: String },
    downloadUrl: { type: String },

    shippingInfo: { type: ShippingInfoSchema, default: () => ({}) },
    returnPolicy: { type: String },

    seo: { type: SEOSchema, default: () => ({}) },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    averageRating: { type: Number, default: 0 },
    numberOfReviews: { type: Number, default: 0 },

    publishedAt: { type: Date },

    customFields: { type: [{ key: String, value: String }], default: [] },
  },
  { timestamps: true },
);

// ---------- Indexes ----------
ProductSchema.index(
  { name: "text", tags: "text", brand: "text", description: "text" },
  {
    weights: { name: 10, tags: 5, brand: 4, description: 1 },
    name: "ProductTextIndex",
  },
);

ProductSchema.index({ name: 1 });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ "variants.sku": 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ category: 1 });

// ─── Low stock & out-of-stock notification helper ──────────────
ProductSchema.methods.checkLowStockAndNotify = async function (): Promise<void> {
  const threshold = this.lowStockThreshold ?? 5;

  // 1. Out-of-stock (stock === 0)
  if (this.stock === 0 && !this.outOfStockNotified) {
    await sendOutOfStockAdminEmail({
      name: this.name,
      sku: this.sku,
      stock: this.stock,
    });
    this.outOfStockNotified = true;
    this.lowStockNotified = true; 
    await this.save();
    return;
  }

  // 2. Reset out-of-stock flag when stock is replenished
  if (this.stock > 0 && this.outOfStockNotified) {
    this.outOfStockNotified = false;
    await this.save();
  }

  // 3. Low stock (stock > 0 but below threshold)
  if (this.stock > 0 && this.stock < threshold && !this.lowStockNotified) {
    await sendLowStockAdminEmail({
      name: this.name,
      sku: this.sku,
      stock: this.stock,
      lowStockThreshold: threshold,
    });
    this.lowStockNotified = true;
    await this.save();
  }

  // 4. Reset low-stock flag when stock is above threshold
  if (this.stock >= threshold && this.lowStockNotified) {
    this.lowStockNotified = false;
    await this.save();
  }
};

export const Product = mongoose.model<IProduct>("Product", ProductSchema);