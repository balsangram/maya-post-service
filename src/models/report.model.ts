import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

/* =========================
   Types
========================= */

export type ReportType =
  | "post"
  | "comment"
  | "like";

export type ReportStatus =
  | "pending"
  | "reviewed"
  | "resolved"
  | "rejected";

/* =========================
   Interface
========================= */

export interface IReport {
  reporterId: Types.ObjectId;

  postId: Types.ObjectId;

  commentId?: Types.ObjectId;

  likeUserId?: Types.ObjectId;

  type: ReportType;

  reason: string;

  status: ReportStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReportDocument
  extends IReport,
    Document {}

/* =========================
   Schema
========================= */

const reportSchema = new Schema<IReportDocument>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },

    commentId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    likeUserId: {
      type: Schema.Types.ObjectId,
      required: false,
      index: true,
    },

    type: {
      type: String,
      enum: ["post", "comment", "like"],
      required: true,
      index: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "reviewed",
        "resolved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

const Report: Model<IReportDocument> =
  mongoose.model<IReportDocument>(
    "Report",
    reportSchema
  );

export default Report;