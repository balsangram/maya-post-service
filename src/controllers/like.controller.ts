import type { Request, Response } from "express";

import {
  likePostRepository,
  unlikePostRepository,
} from "../repositories/like.repository.ts";

import asyncHandler from "../utils/asyncHandler.ts";
import {
  ApiError,
  successResponse,
} from "../utils/response.ts";

export const likePost = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId as string;
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized(
        "User not authenticated"
      );
    }

    const updatedPost = await likePostRepository(
      postId,
      userId
    );

    if (!updatedPost) {
      throw ApiError.notFound(
        "Post not found or already liked"
      );
    }

    return successResponse(
      res,
      "Post liked successfully",
      updatedPost,
      200
    );
  }
);

export const unlikePost = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId as string;
    const userId = req.user?.id;

    if (!userId) {
      throw ApiError.unauthorized(
        "User not authenticated"
      );
    }

    const updatedPost = await unlikePostRepository(
      postId,
      userId
    );

    if (!updatedPost) {
      throw ApiError.notFound("Post not found");
    }

    return successResponse(
      res,
      "Post unliked successfully",
      updatedPost,
      200
    );
  }
);