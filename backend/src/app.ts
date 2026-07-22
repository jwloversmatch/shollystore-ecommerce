import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Import Routes
import authRoutes from "./routes/authRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import productRoutes from "./routes/productRoutes";
import adminUserRoutes from './routes/adminUserRoutes';
import adminInventoryRoutes from './routes/adminInventoryRoutes';
import adminProductRoutes from './routes/adminProductRoutes';  
import uploadRoutes from './routes/uploadRoutes';
import publicSettingsRoutes from './routes/publicSettingsRoutes';
import adminSettingsRoutes from './routes/adminSettingsRoutes';
import adminHeroSlideRoutes from './routes/adminHeroSlideRoutes'; 
import heroSlideRoutes from './routes/heroSlideRoutes'; 
import categoryRoutes from './routes/categoryRoutes';
import adminCategoryRoutes from './routes/adminCategoryRoutes';
import adminMarketingRoutes from './routes/adminMarketingRoutes';
import couponRoutes from './routes/couponRoutes';
import pushRoutes from './routes/pushRoutes';

dotenv.config();

const app: Application = express();

// Security & Middleware
app.use(helmet());
// Allow all origins (simple, works for cron jobs)
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin/orders", adminOrderRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/inventory', adminInventoryRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/upload', uploadRoutes); 
 
app.use('/api/settings/public', publicSettingsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/hero-slides', adminHeroSlideRoutes); 
app.use('/api/hero-slides', heroSlideRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/marketing', adminMarketingRoutes);
app.use('/api/admin/coupons', couponRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/push', pushRoutes);

// Health Check (public)
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Ping endpoints for cron jobs to keep Render alive
app.get("/api/ping", (req: Request, res: Response) => {
  res.status(200).json({ status: "pong" });
});

// Extra root-level ping in case cron job omits /api
app.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({ status: "pong" });
});

export default app;