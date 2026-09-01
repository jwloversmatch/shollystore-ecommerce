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
      updated: 0,
      skipped: 0,
      errors: [] as { row: number; message: string }[],
    };

    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      const rowNumber = i + 1;

      try {
        if (!row.name && !row.slug && !row.sku) {
          throw new Error("Name, slug, or SKU is required to identify the product");
        }

        // Resolve category if provided
        let categoryId: string | null = null;
        if (row.category) {
          categoryId = await resolveCategoryId(row.category);
          if (!categoryId) {
            throw new Error(`Category '${row.category}' not found`);
          }
        }

        // Build the data object only with fields that are provided and non-empty
        const updateData: any = {};
        if (row.name?.trim()) updateData.name = row.name.trim();
        if (row.description?.trim()) updateData.description = row.description.trim();
        if (row.price !== undefined && row.price !== "") {
          const price = parseFloat(row.price);
          if (isNaN(price) || price < 0) throw new Error("Invalid price");
          updateData.price = price;
        }
        if (row.compareAtPrice !== undefined && row.compareAtPrice !== "") {
          const compareAtPrice = parseFloat(row.compareAtPrice);
          if (isNaN(compareAtPrice) || compareAtPrice < 0) throw new Error("Invalid compareAtPrice");
          updateData.compareAtPrice = compareAtPrice;
        }
        if (categoryId) updateData.category = categoryId;
        if (row.images !== undefined && row.images !== "") {
          updateData.images = row.images
            .split(",")
            .map((url: string) => url.trim())
            .filter(Boolean);
        }
        if (row.stock !== undefined && row.stock !== "") {
          const stock = parseInt(row.stock, 10);
          if (isNaN(stock) || stock < 0) throw new Error("Invalid stock");
          updateData.stock = stock;
        }
        if (row.sku?.trim()) updateData.sku = row.sku.trim();
        if (row.brand?.trim()) updateData.brand = row.brand.trim();
        if (row.tags !== undefined && row.tags !== "") {
          updateData.tags = row.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter(Boolean);
        }
        if (row.isActive !== undefined && row.isActive !== "") {
          updateData.isActive = row.isActive.toLowerCase() === "true";
        }

        // Determine slug from row or generate from name (only for new products)
        let slug = row.slug?.trim();
        if (!slug && row.name?.trim()) {
          slug = row.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        }

        // Try to find existing product by slug or SKU
        let existingProduct = null;
        if (slug) {
          existingProduct = await Product.findOne({ slug });
        }
        if (!existingProduct && row.sku) {
          existingProduct = await Product.findOne({ sku: row.sku.trim() });
        }

        if (existingProduct) {
          // Update existing product (only provided fields)
          Object.assign(existingProduct, updateData);
          await existingProduct.save();
          results.updated++;
        } else {
          // Create new product
          if (!updateData.name || !updateData.price || !updateData.category) {
            throw new Error("Name, price, and category are required for new products");
          }
          if (!slug) {
            throw new Error("Slug is required (could not be generated)");
          }
          // Check slug uniqueness again before creation
          const slugExists = await Product.findOne({ slug });
          if (slugExists) {
            throw new Error(`Product with slug '${slug}' already exists`);
          }

          const productData = { ...updateData, slug };
          const product = new Product(productData);
          await product.save();
          results.created++;
        }
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
      updated: results.updated,
      skipped: results.skipped,
      errors: results.errors,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};