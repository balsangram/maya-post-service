import express from "express";

import authMiddleware from "../middlewares/auth.middleware.ts";
import authorize from "../middlewares/authorize.middleware.ts";
import upload from "../middlewares/upload.middleware.ts";

import {
  createPost,
  deletePost,
  displayPosts,
  displayRecommendedPosts,
  editPost,
  searchPosts,
} from "../controllers/post.controller.ts";
import { likePost, unlikePost } from "../controllers/like.controller.ts";
import { addComment, deleteComment, displayComments } from "../controllers/comment.controller.ts";

const router = express.Router();

// ==============================
// Create Post
// ==============================

router.post(
  "/v1",
  authMiddleware,
  authorize("User"),
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  createPost
);

// ==============================
// Edit Post
// ==============================

router.patch(
  "/v1/:postId",
  authMiddleware,
  authorize("User"),
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "videos",
      maxCount: 5,
    },
  ]),
  editPost
);
// ==============================
// Delete Post
// ==============================

router.delete(
  "/v1/:postId",
  authMiddleware,
  authorize("User"),
  deletePost
);

// ==============================
// Display Posts
// ==============================

router.get(
  "/v1",
  authMiddleware,
  authorize("User"),
  displayPosts
);

// ==============================
// Recommended Posts
// ==============================

router.get(
  "/v1/recommended",
  authMiddleware,
  authorize("User"),
  displayRecommendedPosts
);

// ==============================
// Search Posts
// ==============================

router.get(
  "/v1/search",
  authMiddleware,
  authorize("User"),
  searchPosts
);

// ==============================
// Like Post
// ==============================

router.post(
  "/v1/:postId/like",
  authMiddleware,
  authorize("User"),
  likePost
);

// ==============================
// Unlike Post
// ==============================

router.delete(
  "/v1/:postId/like",
  authMiddleware,
  authorize("User"),
  unlikePost
);

// ==============================
// Add Comment
// ==============================

router.post(
  "/v1/:postId/comment",
  authMiddleware,
  authorize("User"),
  addComment
);

// ==============================
// Delete Comment
// ==============================

router.delete(
  "/v1/:postId/comment/:commentId",
  authMiddleware,
  authorize("User"),
  deleteComment
);

// display comments

router.get(
  "/v1/:postId/comments",
  authMiddleware,
  authorize("User"),
  displayComments
);

export default router;