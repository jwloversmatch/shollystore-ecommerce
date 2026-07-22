import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";

// Helper: given a category identifier (slug or ID), return the category doc and all its descendant IDs
const resolveCategoryWithDescendants = async (identifier: string) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const category = isObjectId
    ? await Category.findById(identifier)
    : await Category.findOne({ slug: identifier });

  if (!category) return null;

  // Get all child IDs (uses the static method we added to the Category model)
  const childIds = await Category.getAllChildIds(category._id);
  return [category._id, ...childIds];
};

// @desc    Fetch all products (with optional category filter)
// @route   GET /api/products?category=hair&includeSubcategories=true
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const filter: any = {};

    // Category filtering
    if (req.query.category) {
      const includeSubcategories = req.query.includeSubcategories !== "false"; // default true
      if (includeSubcategories) {
        const categoryIds = await resolveCategoryWithDescendants(
          req.query.category as string,
        );
        if (!categoryIds) {
          res.status(400).json({ message: "Category not found" });
          return;
        }
        filter.category = { $in: categoryIds };
      } else {
        // Only the exact category (by ID or slug)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(
          req.query.category as string,
        );
        if (req.query.category !== undefined) {
          const categoryParam = req.query.category;
          const includeSubcategories =
            req.query.includeSubcategories !== "false"; // default true

          // Normalize to a plain string
          const categoryValue = Array.isArray(categoryParam)
            ? String(categoryParam[0])
            : String(categoryParam);

          if (includeSubcategories) {
            const categoryIds =
              await resolveCategoryWithDescendants(categoryValue);
            if (!categoryIds) {
              res.status(400).json({ message: "Category not found" });
              return;
            }
            filter.category = { $in: categoryIds };
          } else {
            // Only the exact category (by ID or slug)
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryValue);
            if (isObjectId) {
              filter.category = categoryValue;
            } else {
              const category = await Category.findOne({ slug: categoryValue });
              if (!category) {
                res.status(400).json({ message: "Category not found" });
                return;
              }
              filter.category = category._id;
            }
          }
        }
      }
    }

    // Other potential filters (example: featured, stock, etc.) can be added here
    // e.g., if (req.query.featured) filter.isFeatured = true;

    const products = await Product.find(filter)
      .populate("category", "name slug parent") // now we get the referenced category info
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single product by slug
// @route   GET /api/products/:slug
export const getProductBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
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
