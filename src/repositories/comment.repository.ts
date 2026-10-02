import Post from "../models/post.model.ts";

// ==============================
// Add Comment
// ==============================

export const addCommentRepository = async (
  postId: string,
  userId: string,
  content: string
) => {
  return await Post.findOneAndUpdate(
    {
      _id: postId,
      isActive: true,
    },
    {
      $push: {
        comments: {
          userId,
          comment: content,
          createdAt: new Date(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select("comments")
    .lean();
};

// ==============================
// Delete Comment
// ==============================

export const deleteCommentRepository = async (
  postId: string,
  commentId: string,
  userId: string
) => {
  return await Post.findOneAndUpdate(
    {
      _id: postId,
      isActive: true,
      comments: {
        $elemMatch: {
          _id: commentId,
          userId,
        },
      },
    },
    {
      $pull: {
        comments: {
          _id: commentId,
          userId,
        },
      },
    },
    {
      new: true,
    }
  )
    .select("comments")
    .lean();
};

// ==============================
// Display Comments
// ==============================

export const displayCommentsRepository = async (
  postId: string
) => {
  const post = await Post.findOne({
    _id: postId,
    isActive: true,
  })
    .select("comments")
    .lean();

  return post?.comments ?? null;
};