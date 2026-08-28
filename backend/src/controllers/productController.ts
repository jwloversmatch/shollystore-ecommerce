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

// Escapes regex special characters so user input can't break the pattern
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Splits a query into individual words for the regex fallback path
const toSearchWords = (query: string): string[] =>
  query.trim().split(/\s+/).filter(Boolean);

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

    // Featured filter
    if (req.query.featured === "true") {
      filter.isFeatured = true;
    }

    // Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const searchParam = req.query.search
      ? (Array.isArray(req.query.search) ? String(req.query.search[0]) : String(req.query.search)).trim()
      : "";

    if (!searchParam) {
      // No search term – original behavior, newest first
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

    // ── Attempt Atlas Search first ─────────────────────────────────
    try {
      // Build Atlas Search filter array from our filter object
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
            index: "default", // Ensure this matches your Atlas Search index name
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

      // If Atlas Search returned results, send them immediately
      if (total > 0) {
        res.json({
          products,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
        return;
      }
      // Otherwise, continue to regex fallback below
    } catch (err) {
      // Atlas Search failed (index missing, wrong config, etc.)
      // Fall through to regex fallback
      console.warn("Atlas Search failed, using regex fallback:", err);
    }

    // ── Regex fallback (works even without Atlas Search) ───────────
    const words = toSearchWords(searchParam);
    const wordRegexes = words.map((w) => new RegExp(escapeRegex(w), "i"));
    const fallbackFilter = {
      ...filter,
      $or: wordRegexes.flatMap((re) => [
        { name: re },
        { description: re },
        { brand: re },
        { tags: re },
        { sku: re },
      ]),
    };

    const [products, total] = await Promise.all([
      Product.find(fallbackFilter)
        .populate("category", "name slug parent")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(fallbackFilter),
    ]);

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

    // Require at least 2 characters
    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    // Escape regex special characters
    const escaped = escapeRegex(query);
    // Match words that start with the query, case-insensitive
    const prefixRegex = new RegExp(`\\b${escaped}`, "i");

    const matchFilter: any = {
      name: prefixRegex,
      isActive: { $ne: false },
    };

    // Optional category scoping
    if (req.query.category) {
      const includeSubcategories = req.query.includeSubcategories !== "false";
      const categoryParam = Array.isArray(req.query.category)
        ? String(req.query.category[0])
        : String(req.query.category);

      if (includeSubcategories) {
        const categoryIds = await resolveCategoryWithDescendants(categoryParam);
        if (categoryIds) {
          matchFilter.category = { $in: categoryIds };
        }
      } else {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryParam);
        if (isObjectId) {
          matchFilter.category = categoryParam;
        } else {
          const category = await Category.findOne({ slug: categoryParam });
          if (category) {
            matchFilter.category = category._id;
          }
        }
      }
    }

    const results = await Product.find(matchFilter, {
      name: 1,
      slug: 1,
      price: 1,
      images: 1,
      category: 1,
    })
      .limit(8)
      .populate("category", "name slug")
      .lean();

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