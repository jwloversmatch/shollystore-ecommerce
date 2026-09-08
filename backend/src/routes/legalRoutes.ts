import { Router } from "express";
import { getLegalPage } from "../controllers/legalController";

const router = Router();

router.get("/:slug", getLegalPage);

export default router;