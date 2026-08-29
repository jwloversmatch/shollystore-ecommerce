import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { mongoSanitizeMiddleware } from "./middleware/mongoSanitize";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

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
import contactRoutes from './routes/contactRoutes'; // <-- new import
import { getSitemap, getRobotsTxt } from './routes/seoRoutes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { securityLogger } from './middleware/securityLogger';

dotenv.config();

const app: Application = express();

// Trust proxy headers (Render, Heroku, etc.)
app.set('trust proxy', 1);

// ── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// ── CORS — restrict to known origins in production ──────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS || '').split(','),
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
]
  .map((o) => o?.trim())
  .filter(Boolean)
  .filter((o, i, arr) => arr.indexOf(o) === i);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitizeMiddleware);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(securityLogger);
app.use('/api', apiLimiter);

// ── SEO routes (public) ─────────────────────────────────────────────────────
app.get('/sitemap.xml', getSitemap);
app.get('/robots.txt', getRobotsTxt);

// ── API routes ──────────────────────────────────────────────────────────────
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
app.use("/api/contact", contactRoutes); // <-- new mount

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.get("/api/ping", (_req: Request, res: Response) => {
  res.status(200).json({ status: "pong" });
});

app.get("/ping", (_req: Request, res: Response) => {
  res.status(200).json({ status: "pong" });
});

app.use(errorHandler);

export default app;