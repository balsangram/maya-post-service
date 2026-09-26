import express from "express";

import authMiddleware from "../middlewares/auth.middleware.ts";
import authorize from "../middlewares/authorize.middleware.ts";
import upload from "../middlewares/upload.middleware.ts";

import {
  createPost,
  deletePost,
  displayPosts,
  editPost,
} from "../controllers/post.controller.js";

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

export default router;