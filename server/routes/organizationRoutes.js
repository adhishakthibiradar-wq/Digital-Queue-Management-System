import express from "express";
import { createOrganization,
        getOrganizations,
        } from "../controllers/organizationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Organization
router.post("/", protect, createOrganization);
router.get("/", protect, getOrganizations);

export default router;