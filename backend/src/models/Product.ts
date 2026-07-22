// models/Product.ts
import mongoose, { Document, Schema } from 'mongoose';

// ─── Variant sub‑schema ────────────────────────────────────────
export interface IVariant {
  sku?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
  images?: string[];
  isActive?: boolean;
}

const VariantSchema = new Schema<IVariant>({
  sku:     { type: String },
  color:   { type: String },
  size:    { type: String },
  price:   { type: Number },
  stock:   { type: Number },
  images:  { type: [String] },
  isActive:{ type: Boolean, default: true },
}, { _id: true });

// ─── Shipping info ─────────────────────────────────────────────
export interface IShippingInfo {
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  shippingClass?: string;
  freeShipping?: boolean;
}

const ShippingInfoSchema = new Schema<IShippingInfo>({
  weight:       { type: Number },
  weightUnit:   { type: String, enum: ['kg', 'g', 'lb', 'oz'] },
  dimensions: {
    length:     { type: Number },
    width:      { type: Number },
    height:     { type: Number },
    unit:       { type: String, enum: ['cm', 'in'] },
  },
  shippingClass:{ type: String },
  freeShipping: { type: Boolean, default: false },
}, { _id: false });

// ─── SEO info ──────────────────────────────────────────────────
export interface ISEO {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
}

const SEOSchema = new Schema<ISEO>({
  metaTitle:       { type: String },
  metaDescription: { type: String },
  metaKeywords:    { type: String },
  ogImage:         { type: String },
}, { _id: false });

// ─── Main Product interface ────────────────────────────────────
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: mongoose.Types.ObjectId;   // 🔁 now a reference
  images: string[];
  stock: number;
  isFeatured: boolean;

  // identity / inventory
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
  inventoryPolicy?: 'deny' | 'continue';
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
}

// ─── Product schema ────────────────────────────────────────────
const ProductSchema = new Schema<IProduct>(
  {
    name:            { type: String, required: true, trim: true },
    slug:            { type: String, required: true, unique: true, lowercase: true },
    description:     { type: String, required: true },
    price:           { type: Number, required: true, min: 0 },
    compareAtPrice:  { type: Number, min: 0 },
    category:        { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images:          { type: [String], default: [] },
    stock:           { type: Number, required: true, default: 0 },
    isFeatured:      { type: Boolean, default: false },

    sku:            { type: String, unique: true, sparse: true },
    barcode:        { type: String },
    brand:          { type: String },
    tags:           { type: [String], index: true },
    discount: {
      percentage:   { type: Number, min: 0, max: 100 },
      validUntil:   { type: Date },
    },
    attributes:     { type: Map, of: Schema.Types.Mixed },
    variants:       { type: [VariantSchema], default: [] },

    isActive:       { type: Boolean, default: true },
    isDigital:      { type: Boolean, default: false },
    isGiftCard:     { type: Boolean, default: false },
    preOrder:       { type: Boolean, default: false },

    inventoryPolicy: { type: String, enum: ['deny', 'continue'], default: 'deny' },
    minOrderQuantity:{ type: Number, default: 1 },
    maxOrderQuantity:{ type: Number },

    taxable:        { type: Boolean, default: true },
    taxClass:       { type: String, default: 'standard' },

    videoUrl:       { type: String },
    downloadUrl:    { type: String },

    shippingInfo:   { type: ShippingInfoSchema, default: () => ({}) },
    returnPolicy:   { type: String },

    seo:            { type: SEOSchema, default: () => ({}) },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    averageRating:  { type: Number, default: 0 },
    numberOfReviews:{ type: Number, default: 0 },

    publishedAt:    { type: Date },

    customFields:   { type: [{ key: String, value: String }], default: [] },
  },
  { timestamps: true }
);

// ---------- Indexes ----------
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ stock: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ isActive: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);