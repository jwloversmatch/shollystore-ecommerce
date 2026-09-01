import { Request, Response } from "express";
import csv from "csvtojson";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import {
  getAllUserEmails,
  sendNewArrivalEmail,
} from "../services/marketingEmail.service";

// Helper to resolve category ID from ObjectId, name, or slug
const resolveCategoryId = async (input: string): Promise<string | null> => {
  const trimmed = input?.trim();
  if (!trimmed) return null;

  // If it's an ObjectId
  if (/^[0-9a-fA-F]{24}$/.test(trimmed)) {
    const cat = await Category.findById(trimmed);
    return cat ? cat._id.toString() : null;
  }

  // Otherwise treat as name or slug
  const cat = await Category.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${trimmed}$`, "i") } },
      { slug: { $regex: new RegExp(`^${trimmed}$`, "i") } },
    ],
  });
  return cat ? cat._id.toString() : null;
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.category) {
      res.status(400).json({ message: "Category is required" });
      return;
    }
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      res.status(400).json({ message: "Invalid category ID" });
      return;
    }

    const product = new Product(req.body);
    const createdProduct = await product.save();

    if (req.body.notifyCustomers) {
      const recipients = await getAllUserEmails();
      const productImage = createdProduct.images?.[0] || "";
      const productUrl = `${process.env.CLIENT_URL}/products/${createdProduct.slug || createdProduct._id}`;

      sendNewArrivalEmail(
        recipients,
        createdProduct.name,
        productImage,
        productUrl,
        createdProduct.description,
      ).catch((err) =>
        console.error("Failed to send new‑arrival emails:", err),
      );
    }

    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (req.body.category && req.body.category !== product.category.toString()) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    await product.checkLowStockAndNotify();
    res.json(updatedProduct);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import products from CSV
export const bulkImportProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "CSV file is required" });
      return;
    }

    const csvString = req.file.buffer.toString("utf8");
    const products = await csv().fromString(csvString);

    if (!products.length) {
      res.status(400).json({ message: "CSV file is empty" });
      return;
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as { row: number; message: string }[],
    };

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const rowNumber = i + 1;

      try {
        if (!row.name || !row.price || !row.category) {
          throw new Error("Name, price, and category are required");
        }

        const price = parseFloat(row.price);
        if (isNaN(price) || price < 0) {
          throw new Error("Invalid price");
        }

        const categoryId = await resolveCategoryId(row.category);
        if (!categoryId) {
          throw new Error(`Category '${row.category}' not found`);
        }

        const images = row.images
          ? row.images.split(",").map((url: string) => url.trim()).filter(Boolean)
          : [];

        const tags = row.tags
          ? row.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
          : [];

        const slug = row.slug?.trim() || row.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        const existing = await Product.findOne({ slug });
        if (existing) {
          throw new Error(`Product with slug '${slug}' already exists`);
        }

        const productData = {
          name: row.name.trim(),
          slug,
          description: row.description?.trim() || "",
          price,
          compareAtPrice: row.compareAtPrice ? parseFloat(row.compareAtPrice) : undefined,
          category: categoryId,
          images,
          stock: row.stock ? parseInt(row.stock, 10) : 0,
          sku: row.sku?.trim(),
          brand: row.brand?.trim(),
          tags,
          isActive: row.isActive ? row.isActive.toLowerCase() === "true" : true,
        };

        await Product.create(productData);
        results.created++;
      } catch (err: any) {
        results.skipped++;
        results.errors.push({
          row: rowNumber,
          message: err.message || "Unknown error",
        });
      }
    }

    res.json({
      success: true,
      total: products.length,
      created: results.created,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};