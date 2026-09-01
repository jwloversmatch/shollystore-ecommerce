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

const router = express.Router();

router.route("/").get(getProducts);

router.get("/suggestions", getProductSuggestions);

// Review routes (must be before /:slug to avoid conflict)
router.route("/:productId/reviews")
  .get(getProductReviews)
  .post(protect, createReview);

router.route("/:productId/reviews/:reviewId")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.get("/:slug", getProductBySlug);

export default router;