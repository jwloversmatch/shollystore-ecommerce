import express from "express";
import {
  getSettings,
  updateSettings,
  getSettingsChanges,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
} from "../controllers/adminSettingsController";
import { protect } from "../middleware/auth";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

router
  .route("/")
  .get(protect, isAdmin, getSettings)
  .put(protect, isAdmin, updateSettings);

router.get("/changes", protect, isAdmin, getSettingsChanges);

router.route("/bank-accounts").post(protect, isAdmin, addBankAccount);

router
  .route("/bank-accounts/:accountId")
  .put(protect, isAdmin, updateBankAccount)
  .delete(protect, isAdmin, deleteBankAccount);

router
  .route("/bank-accounts/:accountId/default")
  .put(protect, isAdmin, setDefaultBankAccount);

export default router;
