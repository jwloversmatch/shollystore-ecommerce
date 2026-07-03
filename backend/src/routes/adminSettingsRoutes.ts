import express from "express";
import {
  getSettings,
  updateSettings,
  getSettingsChanges,                    
} from "../controllers/adminSettingsController";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

router
  .route("/")
  .get(protect, isAdmin, getSettings)
  .put(protect, isAdmin, updateSettings);

router.get("/changes", protect, isAdmin, getSettingsChanges);   

export default router;