import Post from "../models/post.model.ts";

export const likePostRepository = async (
  postId: string,
  userId: string
) => {
  return await Post.findOneAndUpdate(
    {
      _id: postId,
      isActive: true,

      // Prevent duplicate likes
      "likes.userId": {
        $ne: userId,
      },
    },
    {
      $push: {
        likes: {
          userId,
          createdAt: new Date(),
        },
      },
    },
    {
      new: true,
    }
  ).lean();
};

export const unlikePostRepository = async (
  postId: string,
  userId: string
) => {
  return await Post.findOneAndUpdate(
    {
      _id: postId,
      isActive: true,
    },
    {
      $pull: {
        likes: {
          userId,
        },
      },
    },
    {
      new: true,
    }
  ).lean();
};