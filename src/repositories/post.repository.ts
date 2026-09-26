
import Post from "../models/post.model.ts";

// ==============================
// Create Post
// ==============================

export const createPostRepository = async (postData: any) => {
  return await Post.create(postData);
};

// ==============================
// Find Post By ID
// ==============================

export const findPostByIdRepository = async (postId: string) => {
  return await Post.findById(postId);
};

// ==============================
// Update Post
// ==============================

export const updatePostRepository = async (
  postId: string,
  updateData: any
) => {
  return await Post.findOneAndUpdate(
    {
      _id: postId,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// ==============================
// Delete Post
// ==============================

export const deletePostRepository = async (postId: string) => {
  return await Post.findByIdAndDelete(postId);
};

// ==============================
// Display Posts
// ==============================

export const findPostsRepository = async (
  filter: any = {},
  skip = 0,
  limit = 10
) => {
  const query = {
    ...filter,
    isActive: true,
  };

  const [posts, total] = await Promise.all([
    Post.find(query)
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit)
      .lean(),

    Post.countDocuments(query),
  ]);

  return {
    posts,
    total,
  };
};