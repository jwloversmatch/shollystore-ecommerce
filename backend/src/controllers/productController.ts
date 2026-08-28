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

// Helper to extract Atlas Search filter array from a `filter` object
const buildSearchFilterArray = (filter: any) => {
  const searchFilters: any[] = [];

  if (filter.category) {
    if (filter.category.$in) {
      // Multiple category IDs
      searchFilters.push({ in: { path: "category", value: filter.category.$in } });
    } else {
      // Single category ID
      searchFilters.push({ equals: { path: "category", value: filter.category } });
    }
  }

  if (filter.isFeatured === true) {
    searchFilters.push({ equals: { path: "isFeatured", value: true } });
  }

  return searchFilters;
};

// @desc    Fetch products (with optional filters, pagination)
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Category filtering (unchanged from your original)
    if (req.query.category) {
      const includeSubcategories = req.query.includeSubcategories !== "false";
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

    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const searchParam = req.query.search
      ? (Array.isArray(req.query.search) ? String(req.query.search[0]) : String(req.query.search)).trim()
      : "";

    if (!searchParam) {
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
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
      return;
    }

    // Build Atlas Search filter array
    const searchFilters: any[] = [];
    if (filter.category) {
      if (filter.category.$in) {
        searchFilters.push({ in: { path: "category", value: filter.category.$in } });
      } else {
        searchFilters.push({ equals: { path: "category", value: filter.category } });
      }
    }
    if (filter.isFeatured === true) {
      searchFilters.push({ equals: { path: "isFeatured", value: true } });
    }

    const pipeline: any[] = [
      {
        $search: {
          index: "default",
          compound: {
            must: [
              {
                text: {
                  query: searchParam,
                  path: ["name", "description", "brand", "tags", "sku"],
                  fuzzy: { maxEdits: 2 },
                },
              },
            ],
            filter: searchFilters,
          },
        },
      },
      {
        $facet: {
          results: [
            { $sort: { score: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
              },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const aggregationResult = await Product.aggregate(pipeline).exec();
    const result = aggregationResult[0] || { results: [], totalCount: [] };

    const products = result.results || [];
    const total = result.totalCount?.length > 0 ? result.totalCount[0].count : 0;

    res.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Lightweight autocomplete suggestions as the user types
// @route   GET /api/products/suggestions?q=...&category=...
export const getProductSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const raw = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const query = String(raw || "").trim();

    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    // Build category filter if present (same as main search)
    const filter: any = {};
    if (req.query.category) {
      const includeSubcategories = req.query.includeSubcategories !== "false";
      const categoryParam = Array.isArray(req.query.category)
        ? String(req.query.category[0])
        : String(req.query.category);

      if (includeSubcategories) {
        const categoryIds = await resolveCategoryWithDescendants(categoryParam);
        if (categoryIds) {
          filter.category = { $in: categoryIds };
        }
      } else {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryParam);
        if (isObjectId) {
          filter.category = categoryParam;
        } else {
          const category = await Category.findOne({ slug: categoryParam });
          if (category) {
            filter.category = category._id;
          }
        }
      }
    }

    const searchFilters = buildSearchFilterArray(filter);

    const pipeline: any[] = [
      {
        $search: {
          index: "default",
          compound: {
            must: [
              {
                autocomplete: {
                  query,
                  path: "name",
                  fuzzy: { maxEdits: 1 },
                },
              },
            ],
            filter: searchFilters,
          },
        },
      },
      { $limit: 8 },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { name: 1, slug: 1, price: 1, images: 1, category: 1 } },
    ];

    const results = await Product.aggregate(pipeline);
    res.json({ suggestions: results });
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