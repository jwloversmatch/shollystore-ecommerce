import { Application, Request, Response } from "express";

import authRoutes from "./authRoutes";
import orderRoutes from "./orderRoutes";
import adminOrderRoutes from "./adminOrderRoutes";
import productRoutes from "./productRoutes";
import adminUserRoutes from "./adminUserRoutes";
import adminInventoryRoutes from "./adminInventoryRoutes";
import adminProductRoutes from "./adminProductRoutes";
import uploadRoutes from "./uploadRoutes";
import publicSettingsRoutes from "./publicSettingsRoutes";
import adminSettingsRoutes from "./adminSettingsRoutes";
import adminHeroSlideRoutes from "./adminHeroSlideRoutes";
import heroSlideRoutes from "./heroSlideRoutes";
import categoryRoutes from "./categoryRoutes";
import adminCategoryRoutes from "./adminCategoryRoutes";
import adminMarketingRoutes from "./adminMarketingRoutes";
import couponRoutes from "./couponRoutes";
import pushRoutes from "./pushRoutes";
import contactRoutes from "./contactRoutes";
import wishlistRoutes from "./wishlistRoutes";
import adminReviewRoutes from "./adminReviewRoutes";
import { getSitemap, getRobotsTxt } from "./seoRoutes";
import cartRoutes from "./cartRoutes";
import { processAbandonedCarts } from "../controllers/cartController";
import { processEmailQueue } from "../controllers/emailWorkerController"; 

export const mountRoutes = (app: Application) => {
  // SEO routes
  app.get("/sitemap.xml", getSitemap);
  app.get("/robots.txt", getRobotsTxt);

  // Public routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/coupons", couponRoutes);
  app.use("/api/hero-slides", heroSlideRoutes);
  app.use("/api/push", pushRoutes);
  app.use("/api/contact", contactRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/settings/public", publicSettingsRoutes);
  app.use("/api/cart", cartRoutes);
  app.get("/api/cron/abandoned-cart", processAbandonedCarts);
  app.get("/api/cron/process-emails", processEmailQueue); 

  // Admin routes
  app.use("/api/admin/orders", adminOrderRoutes);
  app.use("/api/admin/users", adminUserRoutes);
  app.use("/api/admin/inventory", adminInventoryRoutes);
  app.use("/api/admin/products", adminProductRoutes);
  app.use("/api/admin/reviews", adminReviewRoutes);
  app.use("/api/admin/settings", adminSettingsRoutes);
  app.use("/api/admin/hero-slides", adminHeroSlideRoutes);
  app.use("/api/admin/categories", adminCategoryRoutes);
  app.use("/api/admin/marketing", adminMarketingRoutes);
  app.use("/api/admin/coupons", couponRoutes);
  app.use("/api/upload", uploadRoutes);
};