import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

const resolveCategoryWithDescendants = async (identifier: string) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const category = isObjectId
    ? await Category.findById(identifier)
    : await Category.findOne({ slug: identifier });
  if (!category) return null;
  const childIds = await Category.getAllChildIds(category._id);
  return [category._id, ...childIds];
};

// @desc    Fetch products (with optional filters, pagination)
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Category filtering
    if (req.query.category) {
      const includeSubcategories = req.query.includeSubcategories !== "false";

      // Convert to plain string (Express can sometimes give an array, but we expect a single value)
      const categoryParam = Array.isArray(req.query.category)
        ? String(req.query.category[0])
        : String(req.query.category);

      if (includeSubcategories) {
        const categoryIds = await resolveCategoryWithDescendants(categoryParam);
        if (!categoryIds) {
          res.status(400).json({ message: "Category not found" });
          return;
        }
        filter.category = { $in: categoryIds };
      } else {
        // Only the exact category (by ID or slug)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryParam);
        if (isObjectId) {
          filter.category = categoryParam;
        } else {
          const category = await Category.findOne({ slug: categoryParam });
          if (!category) {
            res.status(400).json({ message: "Category not found" });
            return;
          }
          filter.category = category._id;
        }
      }
    }

    // Featured filter
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug parent")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by slug
// @route   GET /api/products/:slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug parent")
      .populate("relatedProducts", "name slug images price");

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};