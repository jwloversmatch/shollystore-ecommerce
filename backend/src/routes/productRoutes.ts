import express from "express";
import {
  getProducts,
  getProductBySlug,
  getProductSuggestions,
} from "../controllers/productController";
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController";
import { protect } from "../middleware/auth";
import { reviewLimiter } from "../middleware/rateLimiter"; 

const router = express.Router();

router.route("/").get(getProducts);

router.get("/suggestions", getProductSuggestions);

router
  .route("/:productId/reviews")
  .get(getProductReviews)
  .post(protect, reviewLimiter, createReview);

router
  .route("/:productId/reviews/:reviewId")
  .put(protect, reviewLimiter, updateReview)   
  .delete(protect, reviewLimiter, deleteReview);

router.get("/:slug", getProductBySlug);

export default router;