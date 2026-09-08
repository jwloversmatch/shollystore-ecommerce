import { Request, Response } from "express";
import { LegalPage, LegalPageSlug } from "../models/Legal";
import { AuthRequest } from "../middleware/auth";

const VALID_SLUGS: LegalPageSlug[] = ["privacy", "terms", "returns"];

const DEFAULTS: Record<LegalPageSlug, { title: string; content: string }> = {
  privacy: {
    title: "Privacy Policy",
    content:
      "_This page hasn't been filled in yet. Add your privacy policy content from the admin panel._",
  },
  terms: {
    title: "Terms of Service",
    content:
      "_This page hasn't been filled in yet. Add your terms of service content from the admin panel._",
  },
  returns: {
    title: "Return Policy",
    content:
      "_This page hasn't been filled in yet. Add your return policy content from the admin panel._",
  },
};

// @desc    Get a single legal page by slug
// @route   GET /api/legal/:slug
export const getLegalPage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const slug = req.params.slug as LegalPageSlug;
    if (!VALID_SLUGS.includes(slug)) {
      res.status(404).json({ success: false, message: "Page not found" });
      return;
    }

    let page = await LegalPage.findOne({ slug });
    if (!page) {
      // First-ever request for this page — seed it with a placeholder so
      // the public page never renders completely blank before an admin
      // has visited the editor.
      page = await LegalPage.create({ slug, ...DEFAULTS[slug] });
    }

    res.json({ success: true, page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all legal pages
// @route   GET /api/admin/legal
export const getAllLegalPages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const existing = await LegalPage.find();
    const existingSlugs = new Set(existing.map((p) => p.slug));

    const missing = VALID_SLUGS.filter((slug) => !existingSlugs.has(slug));
    if (missing.length > 0) {
      const created = await LegalPage.insertMany(
        missing.map((slug) => ({ slug, ...DEFAULTS[slug] })),
      );
      existing.push(...created);
    }

    res.json({ success: true, pages: existing });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a legal page
// @route   PUT /api/admin/legal/:slug
export const updateLegalPage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const slug = req.params.slug as LegalPageSlug;
    if (!VALID_SLUGS.includes(slug)) {
      res.status(404).json({ success: false, message: "Page not found" });
      return;
    }

    const { title, content } = req.body;
    if (typeof content !== "string") {
      res.status(400).json({ success: false, message: "Content is required" });
      return;
    }

    const page = await LegalPage.findOneAndUpdate(
      { slug },
      {
        slug,
        title: title || DEFAULTS[slug].title,
        content,
        updatedBy: req.user?.email || "unknown",
      },
      { new: true, upsert: true },
    );

    res.json({ success: true, page });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
