import express from "express";
import { createOrganization,
        getOrganizations,
        } from "../controllers/organizationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Organization
router.post(
  "/",
  protect,
  authorize("admin"),
  createOrganization
);
router.get("/", protect, getOrganizations);

export default router;