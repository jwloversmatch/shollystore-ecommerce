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

    // Category filtering (unchanged)
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

    // Helper to set no-cache headers
    const setNoCache = () => {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
    };

    if (!searchParam) {
      // No search – do not set no-cache (can be cached)
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

    // For any search, prevent caching
    setNoCache();

    // Split search into individual words for AND matching
    const words = toSearchWords(searchParam);
    if (words.length === 0) {
      // Should never happen because searchParam is non-empty after trim
      words.push(searchParam);
    }

    // ── Attempt Atlas Search with AND semantics ────────────────
    try {
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

      // Create a must clause that requires each word to appear in at least one field
      const mustClauses = words.map((word) => ({
        text: {
          query: word,
          path: ["name", "description", "brand", "tags", "sku"],
          fuzzy: { maxEdits: 2 },
        },
      }));

      const pipeline: any[] = [
        {
          $search: {
            index: "default", // confirm this matches your index name
            compound: {
              must: mustClauses,  // ALL words must match
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

      const aggResult = await Product.aggregate(pipeline).exec();
      const resultDoc = aggResult[0] || { results: [], totalCount: [] };
      const products = resultDoc.results || [];
      const total = resultDoc.totalCount?.length > 0 ? resultDoc.totalCount[0].count : 0;

      if (total > 0) {
        res.json({
          products,
          pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
        return;
      }
      // If zero results, fall back to regex
    } catch (err) {
      console.warn("Atlas Search failed, using regex fallback:", err);
    }

    // ── Regex fallback with AND semantics ─────────────────────
    // Create an $and array: for each word, we require it to appear in at least one field
    const andConditions = words.map((word) => {
      const re = new RegExp(escapeRegex(word), "i");
      return {
        $or: [
          { name: re },
          { description: re },
          { brand: re },
          { tags: re },
          { sku: re },
        ],
      };
    });

    const fallbackFilter = {
      ...filter,
      $and: andConditions,
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
    // Prevent caching for suggestions
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const raw = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const query = String(raw || "").trim();

    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const escaped = escapeRegex(query);
    const prefixRegex = new RegExp(`\\b${escaped}`, "i");

    const matchFilter: any = {
      name: prefixRegex,
      isActive: { $ne: false },
    };

    // Category scoping (same as before)
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