import express from "express";
import { protect } from "../middleware/auth";
import {
  saveCart,
  getCart,
} from "../controllers/cartController";

const router = express.Router();

router.post("/", protect, saveCart);
router.get("/", protect, getCart);

export default router;