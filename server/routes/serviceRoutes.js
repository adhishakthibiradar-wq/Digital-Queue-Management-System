import express from "express";
import { createService,
        getServicesByOrganization,
} from "../controllers/serviceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("admin"),
  createService
);
router.get("/:organizationId", protect, getServicesByOrganization);

export default router;