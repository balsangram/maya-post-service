
import Post from "../models/post.model.ts";
import { Types } from "mongoose";

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

export const searchPostsRepository = async (
  searchTerm: string,
  skip = 0,
  limit = 10
) => {
  const query = {
    $or: [
      {
        content: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        "user.name": {
          $regex: searchTerm,
          $options: "i",
        },
      },
    ],
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
}



interface RecommendedPostParams {
  userId: string;
  latitude: number;
  longitude: number;
  district: string;
  state: string;
  reportedPostIds: Types.ObjectId[];
  page: number;
  limit: number;
}

export const displayRecommendedPostsRepository = async ({
  userId,
  latitude,
  longitude,
  district,
  state,
  reportedPostIds,
  page = 1,
  limit = 15,
}: RecommendedPostParams) => {
  const skip = (page - 1) * limit;

  const result = await Post.aggregate([
    // ==========================================
    // 1. Base filter
    // ==========================================

    {
      $match: {
        isActive: true,

        // Don't show reported posts
        _id: {
          $nin: reportedPostIds,
        },

        // Don't show posts already liked
        "likes.userId": {
          $ne: userId,
        },

        // Don't show posts already commented
        "comments.userId": {
          $ne: userId,
        },
      },
    },

    // ==========================================
    // 2. Calculate distance
    // ==========================================

    {
      $addFields: {
        distance: {
          $sqrt: {
            $add: [
              {
                $pow: [
                  {
                    $subtract: [
                      {
                        $arrayElemAt: [
                          "$location.coordinates",
                          1,
                        ],
                      },
                      latitude,
                    ],
                  },
                  2,
                ],
              },

              {
                $pow: [
                  {
                    $subtract: [
                      {
                        $arrayElemAt: [
                          "$location.coordinates",
                          0,
                        ],
                      },
                      longitude,
                    ],
                  },
                  2,
                ],
              },
            ],
          },
        },

        // ========================================
        // Same district
        // ========================================

        sameDistrict: {
          $cond: [
            {
              $eq: [
                {
                  $toLower: {
                    $ifNull: [
                      "$location.district",
                      "",
                    ],
                  },
                },
                district.toLowerCase(),
              ],
            },
            1,
            0,
          ],
        },

        // ========================================
        // Same state
        // ========================================

        sameState: {
          $cond: [
            {
              $eq: [
                {
                  $toLower: {
                    $ifNull: [
                      "$location.state",
                      "",
                    ],
                  },
                },
                state.toLowerCase(),
              ],
            },
            1,
            0,
          ],
        },

        // ========================================
        // Like count
        // ========================================

        likeCount: {
          $size: {
            $ifNull: ["$likes", []],
          },
        },

        // ========================================
        // Comment count
        // ========================================

        commentCount: {
          $size: {
            $ifNull: ["$comments", []],
          },
        },
      },
    },

    // ==========================================
    // 3. Recommendation priority
    // ==========================================

    {
      $addFields: {
        recommendationScore: {
          $add: [
            // Same district
            {
              $multiply: [
                "$sameDistrict",
                100000,
              ],
            },

            // Same state
            {
              $multiply: [
                "$sameState",
                50000,
              ],
            },

            // Likes
            {
              $multiply: [
                "$likeCount",
                10,
              ],
            },

            // Comments
            {
              $multiply: [
                "$commentCount",
                5,
              ],
            },
          ],
        },
      },
    },

    // ==========================================
    // 4. Sort
    // ==========================================

    {
      $sort: {
        // Recommendation priority
        recommendationScore: -1,

        // Nearest
        distance: 1,

        // More likes
        likeCount: -1,

        // More comments
        commentCount: -1,

        // Newest
        createdAt: -1,
      },
    },

    // ==========================================
    // 5. Pagination
    // ==========================================

    {
      $facet: {
        data: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],

        total: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const posts = result[0]?.data ?? [];

  const total =
    result[0]?.total?.[0]?.count ?? 0;

  return {
    posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};