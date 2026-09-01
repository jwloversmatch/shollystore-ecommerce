import express from "express";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";
import {
  getAllReviewsAdmin,
  deleteReviewAdmin,
} from "../controllers/reviewController";

const router = express.Router();

router.route("/")
  .get(protect, isAdmin, getAllReviewsAdmin);

router.route("/:reviewId")
  .delete(protect, isAdmin, deleteReviewAdmin);

export default router;