import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  bulkImportProducts,
  exportProducts,
} from "../controllers/adminProductController";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/export", protect, isAdmin, exportProducts);

router.route("/").post(protect, isAdmin, createProduct);

router.post(
  "/bulk-import",
  protect,
  isAdmin,
  upload.single("file"),
  bulkImportProducts,
);

router
  .route("/:id")
  .put(protect, isAdmin, updateProduct)
  .delete(protect, isAdmin, deleteProduct);

export default router;
