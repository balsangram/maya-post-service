import type { Request, Response } from "express";

import {
  createReportRepository,
  findReportsByUserRepository,
} from "../repositories/report.repository.ts";

import asyncHandler from "../utils/asyncHandler.ts";
import {
  ApiError,
  successResponse,
} from "../utils/response.ts";

// ==============================
// Create Report
// ==============================

export const createReport = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized(
        "User not authenticated"
      );
    }

    const {
      postId,
      commentId,
      likeUserId,
      type,
      reason,
    } = req.body;

    // ==============================
    // Required fields
    // ==============================

    if (!postId) {
      throw ApiError.badRequest(
        "Post ID is required"
      );
    }

    if (!type) {
      throw ApiError.badRequest(
        "Report type is required"
      );
    }

    if (!reason?.trim()) {
      throw ApiError.badRequest(
        "Report reason is required"
      );
    }

    // ==============================
    // Type validation
    // ==============================

    if (
      !["post", "comment", "like"].includes(type)
    ) {
      throw ApiError.badRequest(
        "Invalid report type"
      );
    }

    // ==============================
    // Comment report
    // ==============================

    if (type === "comment" && !commentId) {
      throw ApiError.badRequest(
        "Comment ID is required"
      );
    }

    // ==============================
    // Like report
    // ==============================

    if (type === "like" && !likeUserId) {
      throw ApiError.badRequest(
        "Like user ID is required"
      );
    }

    // ==============================
    // Create report
    // ==============================

    const report = await createReportRepository({
      reporterId: userId,
      postId,
      commentId,
      likeUserId,
      type,
      reason: reason.trim(),
    });

    return successResponse(
      res,
      "Report submitted successfully",
      report,
      201
    );
  }
);

// ==============================
// Display My Reports
// ==============================

export const displayMyReports = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized(
        "User not authenticated"
      );
    }

    const reports =
      await findReportsByUserRepository(userId);

    return successResponse(
      res,
      "Reports retrieved successfully",
      reports,
      200
    );
  }
);