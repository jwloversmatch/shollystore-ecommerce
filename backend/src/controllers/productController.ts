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
// or be used to craft a catastrophic-backtracking (ReDoS) regex.
const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Splits a query into individual words for the regex fallback path below
// (only ever used when the indexed $text search finds literally nothing).
const toSearchWords = (query: string): string[] =>
  query.trim().split(/\s+/).filter(Boolean);

// @desc    Fetch products (with optional filters, pagination)
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
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
      // No search term — original behavior, unchanged: newest first.
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

    // ── Primary path: indexed $text search, ranked by relevance ──────────
    // Uses the weighted text index (name > tags > brand > description), so
    // this scales with catalog size instead of scanning every document the
    // way a plain regex does. $text needs whole recognizable words though —
    // it won't match a query still being typed ("sh" won't find "Shirt").
    // That partial-typing case is what the suggestions endpoint below is for.
    const textFilter = { ...filter, $text: { $search: searchParam } };
    const projection = { score: { $meta: "textScore" } };

    let [products, total] = await Promise.all([
      Product.find(textFilter, projection)
        .populate("category", "name slug parent")
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(textFilter),
    ]);

    // ── Fallback path: only runs if $text found literally nothing ────────
    // Covers what $text structurally can't: typos, partial words, or terms
    // that only appear as a substring rather than a whole token. Looser and
    // slower (unindexed regex), but it only ever pays that cost on a
    // genuine zero-result search, not on every request.
    if (total === 0) {
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

      [products, total] = await Promise.all([
        Product.find(fallbackFilter)
          .populate("category", "name slug parent")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(fallbackFilter),
      ]);
    }

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

    // Require at least 2 characters — a single letter would match a huge
    // fraction of the catalog and isn't a meaningful suggestion yet.
    if (query.length < 2) {
      res.json({ suggestions: [] });
      return;
    }

    const matchFilter: any = { isActive: { $ne: false } };

    // Scoped to the category the user's currently browsing, if any — so
    // typing "sh" while inside Electronics doesn't surface Shirts from
    // Fashion. Falls back to searching the whole catalog if the category
    // param is missing or invalid, rather than erroring out a live dropdown.
    if (req.query.category) {
      const categoryParam = Array.isArray(req.query.category)
        ? String(req.query.category[0])
        : String(req.query.category);
      const categoryIds = await resolveCategoryWithDescendants(categoryParam);
      if (categoryIds) matchFilter.category = { $in: categoryIds };
    }

    const escaped = escapeRegex(query);
    const prefixRegex = new RegExp(`^${escaped}`, "i");
    // \b (word boundary) is a superset of ^ here — it also matches the
    // start of the string — so this one query covers both "starts with
    // the query" and "contains a word starting with the query".
    const wordStartRegex = new RegExp(`\\b${escaped}`, "i");
    matchFilter.name = wordStartRegex;

    const results = await Product.find(
      matchFilter,
      { name: 1, slug: 1, price: 1, images: 1, category: 1 }
    )
      .limit(8)
      .populate("category", "name slug")
      .lean();

    // A true prefix match ("Sh" → "Shirt") is a stronger signal than a
    // match partway through the name ("Sh" → "Men's Shirt") — surface
    // those first without a second database round-trip.
    results.sort((a: any, b: any) => Number(prefixRegex.test(b.name)) - Number(prefixRegex.test(a.name)));

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