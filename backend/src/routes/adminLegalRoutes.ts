import { Router } from "express";
import { getAllLegalPages, updateLegalPage } from "../controllers/legalController";
import { protect } from "../middleware/auth";
import { isAdmin } from '../middleware/isAdmin';


const router = Router();

router.use(protect, isAdmin); 
router.get("/", getAllLegalPages);
router.put("/:slug", updateLegalPage);

export default router;