import { Types } from "mongoose";
import Report from "../models/report.model.ts";

interface CreateReportData {
  reporterId: string;
  postId: string;
  commentId?: string;
  likeUserId?: string;
  type: "post" | "comment" | "like";
  reason: string;
}

// ==============================
// Create Report
// ==============================

export const createReportRepository = async (
  data: CreateReportData
) => {
  return await Report.create({
    reporterId: data.reporterId,
    postId: data.postId,
    commentId: data.commentId,
    likeUserId: data.likeUserId,
    type: data.type,
    reason: data.reason,
    status: "pending",
  });
};

// ==============================
// Display My Reports
// ==============================

export const findReportsByUserRepository = async (
  reporterId: string
) => {
  return await Report.find({
    reporterId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();
};

// ==============================
// Find Reported Post IDs By User
// ==============================

export const findReportedPostIdsByUserRepository = async (
  reporterId: string
): Promise<Types.ObjectId[]> => {
  const reports = await Report.find({
    reporterId: new Types.ObjectId(reporterId),
    type: "post",
  })
    .select("postId")
    .lean();

  return reports.map((report) => report.postId);
};