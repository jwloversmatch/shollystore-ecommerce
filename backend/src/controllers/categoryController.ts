import { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

// ─── Public: get all categories ───────────────────────────────
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter: any = {};

    // Filter by parent (e.g., ?parent=hair to get its direct subcategories)
    // Filter by parent (e.g., ?parent=hair)
if (req.query.parent !== undefined) {
  const parentParam = req.query.parent;

  // Treat "null" string explicitly as null
  if (parentParam === 'null') {
    filter.parent = null;
  } else {
    // Ensure it's a string (could be string[], but we take the first if array)
    const parentValue = Array.isArray(parentParam) ? String(parentParam[0]) : String(parentParam);

    // Check if it's an ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(parentValue);
    if (isObjectId) {
      filter.parent = parentValue;
    } else {
      const parentCat = await Category.findOne({ slug: parentValue });
      if (!parentCat) {
        res.status(400).json({ message: 'Parent category not found' });
        return;
      }
      filter.parent = parentCat._id;
    }
  }
}

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ name: 1 });

    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Optional: Get category tree ──────────────────────────────
export const getCategoryTree = async (_req: Request, res: Response): Promise<void> => {
  try {
    const allCategories = await Category.find().lean();

    // Build a map
    const map: any = {};
    allCategories.forEach((cat: any) => {
      map[cat._id] = { ...cat, children: [] };
    });

    const tree: any[] = [];
    allCategories.forEach((cat: any) => {
      if (cat.parent) {
        const parentId = cat.parent.toString();
        if (map[parentId]) {
          map[parentId].children.push(map[cat._id]);
        }
      } else {
        tree.push(map[cat._id]);
      }
    });

    res.json(tree);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: create category ───────────────────────────────────
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parent } = req.body;

    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }

    // Auto-generate slug from name
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    // Ensure uniqueness (append a counter if needed)
    let existing = await Category.findOne({ slug });
    let counter = 1;
    while (existing) {
      slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${counter}`;
      existing = await Category.findOne({ slug });
      counter++;
    }

    // Validate parent if provided
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        res.status(400).json({ message: 'Parent category not found' });
        return;
      }
    }

    const category = new Category({
      name,
      slug,
      parent: parent || null,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: update category ───────────────────────────────────
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, parent } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // If updating parent, ensure no circular reference
    if (parent !== undefined) {
      if (parent === id) {
        res.status(400).json({ message: 'A category cannot be its own parent' });
        return;
      }
      if (parent) {
        // Check that new parent is not a descendant of this category
        const parentCat = await Category.findById(parent);
        if (!parentCat) {
          res.status(400).json({ message: 'Parent category not found' });
          return;
        }
        // Avoid circular dependency: collect all ancestors of this new parent
        let ancestor = parentCat.parent;
        while (ancestor) {
          if (ancestor.toString() === id) {
            res.status(400).json({ message: 'Circular reference detected' });
            return;
          }
          const next = await Category.findById(ancestor);
          ancestor = next?.parent || null;
        }
      }
      category.parent = parent || null;
    }

    if (name) category.name = name;
    if (slug) {
      // Ensure slug uniqueness
      const existing = await Category.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        res.status(400).json({ message: 'Slug already in use' });
        return;
      }
      category.slug = slug;
    }

    await category.save();
    res.json(category);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin: delete category ───────────────────────────────────
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // 1. Check for subcategories
    const children = await Category.find({ parent: id });
    if (children.length > 0) {
      res.status(400).json({
        message: `Cannot delete category because it has ${children.length} subcategory(ies). Reassign or delete them first.`,
      });
      return;
    }

    // 2. Check for products using this category
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      res.status(400).json({
        message: `Cannot delete category because ${productsCount} product(s) are using it. Reassign them first.`,
      });
      return;
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};