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

const setShortCacheHeaders = (res: Response) => {
  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  setShortCacheHeaders(res);

  try {
    const filter: any = {};

    // Category filtering
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

    // Check if this is an admin request (large limit) to return full documents
    const isAdminRequest = limit > 100;

    const searchParam = req.query.search
      ? (Array.isArray(req.query.search)
          ? String(req.query.search[0])
          : String(req.query.search)
        ).trim()
      : "";

    // No search: standard category/filter browsing
    if (!searchParam) {
      const baseQuery = Product.find(filter)
        .lean()
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // For admin requests, return full documents (no select projection)
      const query = isAdminRequest
        ? baseQuery
        : baseQuery.select(
            "name slug price images stock category averageRating numberOfReviews"
          );

      const [products, total] = await Promise.all([
        query,
        Product.countDocuments(filter),
      ]);

      res.json({
        products,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
      return;
    }

    // ── Single-word search: try to match categories first ──
    const words = toSearchWords(searchParam);
    if (words.length === 1) {
      const term = words[0];
      const categoryRegex = new RegExp(`^${escapeRegex(term)}`, "i");
      const matchedCategories = await Category.find({
        $or: [{ name: categoryRegex }, { slug: categoryRegex }],
      });

      if (matchedCategories.length > 0) {
        const allCategoryIds = new Set<string>();
        for (const cat of matchedCategories) {
          const ids = await resolveCategoryWithDescendants(cat._id.toString());
          if (ids) ids.forEach((id) => allCategoryIds.add(id.toString()));
        }

        if (allCategoryIds.size > 0) {
          const categoryFilter = { $in: Array.from(allCategoryIds) };
          const combinedFilter: any = { ...filter };
          if (combinedFilter.category) {
            const existingCategoryCondition = combinedFilter.category;
            delete combinedFilter.category;
            combinedFilter.$and = [
              { category: categoryFilter },
              { category: existingCategoryCondition },
            ];
          } else {
            combinedFilter.category = categoryFilter;
          }

          const baseQuery = Product.find(combinedFilter)
            .lean()
            .populate("category", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

          const query = isAdminRequest
            ? baseQuery
            : baseQuery.select(
                "name slug price images stock category averageRating numberOfReviews"
              );

          const [products, total] = await Promise.all([
            query,
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

    // ── Exact name match ──
    const exactNameRegex = new RegExp(`^${escapeRegex(searchParam)}$`, "i");

    const baseExactQuery = Product.find({ ...filter, name: exactNameRegex })
      .lean()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const exactQuery = isAdminRequest
      ? baseExactQuery
      : baseExactQuery.select(
          "name slug price images stock category averageRating numberOfReviews"
        );

    const [exactProducts, exactTotal] = await Promise.all([
      exactQuery,
      Product.countDocuments({ ...filter, name: exactNameRegex }),
    ]);

    if (exactTotal > 0) {
      res.json({
        products: exactProducts,
        pagination: {
          page,
          limit,
          total: exactTotal,
          pages: Math.ceil(exactTotal / limit),
        },
      });
      return;
    }

    // ── Multi-word or no exact name match: text search ──
    const searchFilters: any[] = [];
    if (filter.category) {
      if (filter.category.$in) {
        searchFilters.push({
          in: { path: "category", value: filter.category.$in },
        });
      } else {
        searchFilters.push({
          equals: { path: "category", value: filter.category },
        });
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
              {
                $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const aggResult = await Product.aggregate(pipeline).exec();
      const resultDoc = aggResult[0] || { results: [], totalCount: [] };
      const products = resultDoc.results || [];
      const total =
        resultDoc.totalCount?.length > 0 ? resultDoc.totalCount[0].count : 0;

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

    const baseFallbackQuery = Product.find(fallbackFilter)
      .lean()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const fallbackQuery = isAdminRequest
      ? baseFallbackQuery
      : baseFallbackQuery.select(
          "name slug price images stock category averageRating numberOfReviews"
        );

    const [products, total] = await Promise.all([
      fallbackQuery,
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

export const getProductSuggestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  setShortCacheHeaders(res);

  try {
    const raw = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const query = String(raw || "").trim();

    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const words = toSearchWords(query);

    // ── Single‑word search: try to match a category first ─────────────
    if (words.length === 1) {
      const term = words[0];
      const categoryRegex = new RegExp(`^${escapeRegex(term)}`, "i");
      const matchedCategories = await Category.find({
        $or: [{ name: categoryRegex }, { slug: categoryRegex }],
      }).limit(5);

      if (matchedCategories.length > 0) {
        const allCategoryIds = new Set<string>();
        for (const cat of matchedCategories) {
          const ids = await resolveCategoryWithDescendants(cat._id.toString());
          if (ids) ids.forEach((id) => allCategoryIds.add(id.toString()));
        }

        if (allCategoryIds.size > 0) {
          const products = await Product.find({
            category: { $in: Array.from(allCategoryIds) },
            isActive: { $ne: false },
          })
            .select("name slug price images category")
            .limit(8)
            .populate("category", "name slug")
            .lean();

          if (products.length > 0) {
            res.json({ suggestions: products });
            return;
          }
        }
      }
    }

    // ── Text‑based suggestions (fallback) ─────────────────────────────
    const prefixRegexes = words.map((word) => {
      const escaped = escapeRegex(word);
      return new RegExp(`\\b${escaped}`, "i");
    });

    const matchFilter: any = {
      isActive: { $ne: false },
      $or: prefixRegexes.flatMap((re) => [
        { name: re },
        { brand: re },
        { tags: re },
        { sku: re },
      ]),
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

export const getProductBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  setShortCacheHeaders(res);

  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .lean()
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