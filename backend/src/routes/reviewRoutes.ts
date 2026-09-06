import express from "express";
import { getFeaturedReviews } from "../controllers/reviewController";

const router = express.Router();

// Public: get featured reviews across products
router.get("/featured", getFeaturedReviews);

export default router;