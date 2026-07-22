import { Request, Response } from "express";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import {
  getAllUserEmails,
  sendNewArrivalEmail,
} from "../services/marketingEmail.service";

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate category exists (now it's an ObjectId)
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

    // Email notification (unchanged)
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

    // If category is being updated, validate it
    if (req.body.category && req.body.category !== product.category.toString()) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        res.status(400).json({ message: "Invalid category ID" });
        return;
      }
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
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