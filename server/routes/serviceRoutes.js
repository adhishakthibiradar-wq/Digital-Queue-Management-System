import express from "express";
import { createService,
        getServicesByOrganization,
} from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createService);
router.get("/:organizationId", protect, getServicesByOrganization);

export default router;