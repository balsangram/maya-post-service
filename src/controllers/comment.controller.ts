import { Request, Response } from "express";

import {
  addCommentRepository,
  deleteCommentRepository,
  displayCommentsRepository,
} from "../repositories/comment.repository.ts";

import asyncHandler from "../utils/asyncHandler.ts";
import {
  ApiError,
  successResponse,
} from "../utils/response.ts";

// ==============================
// Add Comment
// ==============================

export const addComment = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId as string;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized(
        "User not authenticated"
      );
    }

    if (!content?.trim()) {
      throw ApiError.badRequest(
        "Comment content is required"
      );
    }

    const newComment = await addCommentRepository(
      postId,
      userId,
      content.trim()
    );

    if (!newComment) {
      throw ApiError.notFound("Post not found");
    }

    return successResponse(
      res,
      "Comment added successfully",
      newComment,
      201
    );
  }
);

// ==============================
// Delete Comment
// ==============================

export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId as string;
    const commentId = req.params.commentId as string;
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized(
        "User not authenticated"
      );
    }

    const deletedComment =
      await deleteCommentRepository(
        postId,
        commentId,
        userId
      );

    if (!deletedComment) {
      throw ApiError.notFound(
        "Comment not found or you are not the owner"
      );
    }

    return successResponse(
      res,
      "Comment deleted successfully",
      null,
      200
    );
  }
);

// ==============================
// Display Comments
// ==============================

export const displayComments = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId as string;

    const comments =
      await displayCommentsRepository(postId);

    if (!comments) {
      throw ApiError.notFound("Post not found");
    }

    return successResponse(
      res,
      "Comments retrieved successfully",
      comments,
      200
    );
  }
);