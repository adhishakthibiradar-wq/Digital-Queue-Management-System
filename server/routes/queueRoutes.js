import express from "express";
import {
  generateToken,
  getQueue,
  callNextToken,
  completeToken,
  getDashboard,
  cancelToken,
} from "../controllers/queueController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, generateToken);
router.get("/:organizationId/:serviceId", protect, getQueue);
router.put("/next", protect, authorize("admin"), callNextToken);
router.put("/complete/:queueId", protect, authorize("admin"), completeToken);
router.get("/dashboard", protect, authorize("admin"), getDashboard);
router.put("/cancel/:queueId", protect, cancelToken);

export default router;