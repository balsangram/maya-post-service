import {
  createPostService,
  deletePostService,
  displayPostsService,
  displayRecommendedPostsService,
  editPostService,
  type UploadedFiles,
  type PostType,
} from "../services/post.services.ts";

import asyncHandler from "../utils/asyncHandler.ts";

import ApiError from "../utils/ApiError.ts";

import {
  getPagination,
  paginationResponse,
  successResponse,
} from "../utils/response.ts";

import type { Request, Response } from "express";
import { searchPostsRepository } from "../repositories/post.repository.ts";

// ==============================
// Create Post
// ==============================

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  await createPostService(
    userId,
    req.body,
    (req.files as unknown as UploadedFiles) || {}
  );

  return successResponse(
    res,
    "Post created successfully",
    null,
    201
  );
});

// ==============================
// Edit Post
// ==============================

export const editPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = String(req.params.postId || "");

  if (!postId) {
    throw ApiError.badRequest("Post ID is required");
  }

  console.log("User ID:", userId);
  console.log("Post ID:", postId);

  await editPostService(
    userId,
    postId,
    req.body,
    (req.files as unknown as UploadedFiles) || {}
  );

  return successResponse(
    res,
    "Post updated successfully",
    null,
    200
  );
});
// ==============================
// Delete Post
// ==============================

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = String(req.params.postId || "");

  if (!postId) {
    throw ApiError.badRequest("Post ID is required");
  }

  await deletePostService(
    userId,
    postId
  );

  return successResponse(
    res,
    "Post deleted successfully",
    null,
    200
  );
});

// ==============================
// Display Post s
// ==============================

export const displayPosts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const {
    type = "all",
    page = 1,
    limit = 10,
  } = req.query;

  const allowedTypes = [
    "my",
    "all",
    "friends",
  ];

  if (!allowedTypes.includes(type as string)) {
    throw new ApiError(
      400,
      "Invalid type. Use my, all or friends" 
    );
  }

  const pagination = getPagination(
    Number(page) || 1,
    Number(limit) || 10
  );

  const {
    posts,
    total,
  } = await displayPostsService(
    userId,
    type as PostType,
    pagination.page,
    pagination.limit
  );

  return paginationResponse(
    res,
    "Posts retrieved successfully",
    posts,
    pagination.page,
    pagination.limit,
    total,
    200
  );
});

export const searchPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { query = "", page = 1, limit = 10 } = req.query;

    if (!query) {
      throw ApiError.badRequest("Search query is required");
    }

    const pagination = getPagination(
      Number(page) || 1,
      Number(limit) || 10
    );

    const skip =
      (pagination.page - 1) * pagination.limit;

    const { posts, total } =
      await searchPostsRepository(
        query as string,
        skip,
        pagination.limit
      );

    return paginationResponse(
      res,
      "Posts retrieved successfully",
      posts,
      pagination.page,
      pagination.limit,
      total,
      200
    );
  }
);

// ==============================
// Recommended Posts
// ==============================

export const displayRecommendedPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const { page = 1, limit = 15 } = req.query;

    const pagination = getPagination(
      Number(page) || 1,
      Number(limit) || 15
    );

    const { posts, total } =
      await displayRecommendedPostsService(
        userId,
        pagination.page,
        pagination.limit
      );

    return paginationResponse(
      res,
      "Recommended posts retrieved successfully",
      posts,
      pagination.page,
      pagination.limit,
      total,
      200
    );
  }
);