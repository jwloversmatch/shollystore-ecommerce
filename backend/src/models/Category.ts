// models/Category.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent: mongoose.Types.ObjectId | null;
  children?: ICategory[]; // virtual
  createdAt: Date;
  updatedAt: Date;
}

// Extend the model interface for static methods
interface ICategoryModel extends Model<ICategory> {
  getAllChildIds(parentId: mongoose.Types.ObjectId | string): Promise<mongoose.Types.ObjectId[]>;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      // ✅ REMOVED: unique: true, 
      // We only want unique names within the same parent, not globally.
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true, // Slug must still be globally unique for URLs
      lowercase: true,
      trim: true,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for populating subcategories
CategorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// ---------- Indexes ----------
CategorySchema.index({ parent: 1 });
CategorySchema.index({ slug: 1 });

// ✅ NEW: Compound index ensures uniqueness based on (parent + name)
// This allows "Men's" under Clothing AND "Men's" under Shoes to both exist.
CategorySchema.index({ parent: 1, name: 1 }, { unique: true });

// ---------- Static method: get all descendant category IDs ----------
CategorySchema.statics.getAllChildIds = async function (
  parentId: mongoose.Types.ObjectId | string
): Promise<mongoose.Types.ObjectId[]> {
  const parent = new mongoose.Types.ObjectId(parentId);
  const children = await this.find({ parent });
  let ids = children.map((c: ICategory) => c._id);
  for (const child of children) {
    const grandChildIds = await (this as ICategoryModel).getAllChildIds(child._id);
    ids = ids.concat(grandChildIds);
  }
  return ids;
};

export const Category = mongoose.model<ICategory, ICategoryModel>('Category', CategorySchema);