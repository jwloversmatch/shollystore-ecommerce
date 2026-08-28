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

const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toSearchWords = (query: string): string[] =>
  query.trim().split(/\s+/).filter(Boolean);

// Helper to set aggressive no-cache headers
const setNoCacheHeaders = (res: Response) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.removeHeader("ETag");
  res.removeHeader("Last-Modified");
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  // Always disable caching for product endpoints (including no-search)
  setNoCacheHeaders(res);

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

    // No search: simply return filtered products
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

    // ── Special case: single-word search that exactly matches a category ──
    const words = toSearchWords(searchParam);
    if (words.length === 1) {
      const term = words[0];
      const categoryRegex = new RegExp(`^${escapeRegex(term)}$`, "i");
      const matchedCategory = await Category.findOne({
        $or: [{ name: categoryRegex }, { slug: categoryRegex }],
      });

      if (matchedCategory) {
        // Get all descendant category IDs
        const categoryIds = await resolveCategoryWithDescendants(matchedCategory._id.toString());
        if (categoryIds) {
          // Replace or combine with existing category filter?
          // For simplicity, we will AND with existing category filter if present,
          // but typically user expects products in that category only.
          const categoryFilter = { $in: categoryIds };
          const combinedFilter = { ...filter, category: categoryFilter };

          const [products, total] = await Promise.all([
            Product.find(combinedFilter)
              .populate("category", "name slug parent")
              .sort({ createdAt: -1 })
              .skip(skip)
              .limit(limit),
            Product.countDocuments(combinedFilter),
          ]);

          res.json({
            products,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
          });
          return;
        }
      }
    }

    // ── Multi-word or non-category search: text search ──────────────────────
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

    // For text search, we require ALL words to match (AND)
    const mustClauses = words.map((word) => ({
      text: {
        query: word,
        path: ["name", "description", "brand", "tags", "sku"],
        fuzzy: { maxEdits: 2 },
      },
    }));

    // Try Atlas Search first
    try {
      const pipeline: any[] = [
        {
          $search: {
            index: "default", // ensure this matches your index name
            compound: {
              must: mustClauses,
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
      // If zero results, fall through to regex fallback
    } catch (err) {
      console.warn("Atlas Search failed, using regex fallback:", err);
    }

    // ── Regex fallback (AND semantics) ──────────────────────────────────────
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

export const getProductSuggestions = async (req: Request, res: Response): Promise<void> => {
  // Disable caching for suggestions
  setNoCacheHeaders(res);

  try {
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

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  // Disable caching for single product? Optional, but safe.
  setNoCacheHeaders(res);

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