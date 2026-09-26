import {
  createPostService,
  deletePostService,
  displayPostsService,
  editPostService,
} from "../services/post.services.ts";

import asyncHandler from "../utils/asyncHandler.ts";

import ApiError from "../utils/ApiError.ts";

import {
  getPagination,
  paginationResponse,
  successResponse,
} from "../utils/response.ts";

import { Request, Response } from "express";

// ==============================
// Create Post
// ==============================

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  await createPostService(
    userId,
    req.body,
    req.files
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
  const { postId } = req.params;

  console.log("User ID:", userId);
  console.log("Post ID:", postId);

  await editPostService(
    userId,
    postId,
    req.body,
    req.files || {}
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

  const { postId } = req.params;

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
// Display Posts
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
    page as number,
    limit as number
  );

  const {
    posts,
    total,
  } = await displayPostsService(
    userId,
    type,
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