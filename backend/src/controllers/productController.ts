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

const setNoCacheHeaders = (res: Response) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.removeHeader("ETag");
  res.removeHeader("Last-Modified");
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  setNoCacheHeaders(res);

  try {
    const filter: any = {};

    // Category filtering (if category query param is present)
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

    // No search: standard category/filter browsing
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

    // ── Single‑word search: try to match categories first ───────────────────
    const words = toSearchWords(searchParam);
    if (words.length === 1) {
      const term = words[0];
      // Match categories whose name or slug starts with the term (e.g., "men" -> "men's")
      const categoryRegex = new RegExp(`^${escapeRegex(term)}`, "i");
      const matchedCategories = await Category.find({
        $or: [{ name: categoryRegex }, { slug: categoryRegex }],
      });

      if (matchedCategories.length > 0) {
        // Collect all descendant IDs from every matched category
        const allCategoryIds = new Set<string>();
        for (const cat of matchedCategories) {
          const ids = await resolveCategoryWithDescendants(cat._id.toString());
          if (ids) ids.forEach((id) => allCategoryIds.add(id.toString()));
        }

        if (allCategoryIds.size > 0) {
          const categoryFilter = { $in: Array.from(allCategoryIds) };
          // Combine with any existing category filter (if provided) using $and
          const combinedFilter: any = { ...filter };
          if (combinedFilter.category) {
            // If there was already a category filter, we need to intersect:
            // For simplicity, we'll replace the category filter with this new one,
            // but if the user is already inside a category and searches "men",
            // they likely want "men" within that category. However, the current
            // `filter.category` might be a single ObjectId or $in array. To be safe,
            // we'll use $and with both conditions.
            const existingCategoryCondition = combinedFilter.category;
            delete combinedFilter.category;
            combinedFilter.$and = [
              { category: categoryFilter },
              { category: existingCategoryCondition },
            ];
          } else {
            combinedFilter.category = categoryFilter;
          }

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

    // ── Multi‑word or no category match: text search ─────────────────────────
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

    const mustClauses = words.map((word) => ({
      text: {
        query: word,
        path: ["name", "description", "brand", "tags", "sku"],
        fuzzy: { maxEdits: 2 },
      },
    }));

    try {
      const pipeline: any[] = [
        {
          $search: {
            index: "default",
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
    } catch (err) {
      console.warn("Atlas Search failed, using regex fallback:", err);
    }

    // Regex fallback (AND semantics)
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