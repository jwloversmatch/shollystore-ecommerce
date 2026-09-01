import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { mongoSanitizeMiddleware } from "./middleware/mongoSanitize";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import { mountRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { securityLogger } from "./middleware/securityLogger";

dotenv.config();

const app: Application = express();

// Trust proxy
app.set('trust proxy', 1);

// Security
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

app.use(compression());

// CORS
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

// Mount all routes
mountRoutes(app);

// Health checks
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