import express from "express";

import authMiddleware from "../middlewares/auth.middleware.ts";
import authorize from "../middlewares/authorize.middleware.ts";

import {
  createReport,
  displayMyReports,
} from "../controllers/report.controller.ts";

const router = express.Router();

// ==============================
// Create Report
// ==============================

router.post(
  "/v2",
  authMiddleware,
  authorize("User"),
  createReport
);

// ==============================
// Display My Reports
// ==============================

router.get(
  "/v2",
  authMiddleware,
  authorize("User"),
  displayMyReports
);

export default router;