
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
  latitude?: number;
  longitude?: number;
  pin?: string;
  district?: string;
  state?: string;
  city?: string;
  reportedPostIds: Types.ObjectId[];
  page: number;
  limit: number;
}

export const displayRecommendedPostsRepository = async ({
  userId,
  latitude,
  longitude,
  pin,
  district = "",
  state = "",
  city = "",
  reportedPostIds,
  page = 1,
  limit = 15,
}: RecommendedPostParams) => {
  const skip = (page - 1) * limit;

  const hasCoordinates =
    typeof latitude === "number" && typeof longitude === "number";
  const userPin = typeof pin === "string" ? pin.trim() : "";
  const userDistrict = typeof district === "string" ? district.trim().toLowerCase() : "";
  const userState = typeof state === "string" ? state.trim().toLowerCase() : "";
  const userCity = typeof city === "string" ? city.trim().toLowerCase() : "";

  const userObjectId = Types.ObjectId.isValid(userId)
    ? new Types.ObjectId(userId)
    : null;

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
          $nin: userObjectId ? [userObjectId, userId] : [userId],
        },

        // Don't show posts already commented
        "comments.userId": {
          $nin: userObjectId ? [userObjectId, userId] : [userId],
        },
      },
    },

    // ==========================================
    // 2. Calculate distance and match fields
    // ==========================================

    {
      $addFields: {
        distance: hasCoordinates
          ? {
              $cond: [
                {
                  $and: [
                    { $isArray: "$location.coordinates" },
                    { $eq: [{ $size: "$location.coordinates" }, 2] },
                  ],
                },
                {
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
                null,
              ],
            }
          : null,

        // ========================================
        // Same pin
        // ========================================

        samePin: userPin
          ? {
              $cond: [
                {
                  $or: [
                    { $eq: ["$location.pin", userPin] },
                    { $eq: ["$pin", userPin] },
                  ],
                },
                1,
                0,
              ],
            }
          : 0,

        // ========================================
        // Same district
        // ========================================

        sameDistrict: userDistrict
          ? {
              $cond: [
                {
                  $or: [
                    {
                      $and: [
                        { $ne: ["$location.district", null] },
                        { $ne: ["$location.district", ""] },
                        {
                          $eq: [
                            { $toLower: "$location.district" },
                            userDistrict,
                          ],
                        },
                      ],
                    },
                    {
                      $and: [
                        { $ne: ["$district", null] },
                        { $ne: ["$district", ""] },
                        {
                          $eq: [
                            { $toLower: "$district" },
                            userDistrict,
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            }
          : 0,

        // ========================================
        // Same city
        // ========================================

        sameCity: userCity
          ? {
              $cond: [
                {
                  $or: [
                    {
                      $and: [
                        { $ne: ["$location.city", null] },
                        { $ne: ["$location.city", ""] },
                        {
                          $eq: [
                            { $toLower: "$location.city" },
                            userCity,
                          ],
                        },
                      ],
                    },
                    {
                      $and: [
                        { $ne: ["$city", null] },
                        { $ne: ["$city", ""] },
                        {
                          $eq: [
                            { $toLower: "$city" },
                            userCity,
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            }
          : 0,

        // ========================================
        // Same state
        // ========================================

        sameState: userState
          ? {
              $cond: [
                {
                  $or: [
                    {
                      $and: [
                        { $ne: ["$location.state", null] },
                        { $ne: ["$location.state", ""] },
                        {
                          $eq: [
                            { $toLower: "$location.state" },
                            userState,
                          ],
                        },
                      ],
                    },
                    {
                      $and: [
                        { $ne: ["$state", null] },
                        { $ne: ["$state", ""] },
                        {
                          $eq: [
                            { $toLower: "$state" },
                            userState,
                          ],
                        },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            }
          : 0,

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
            // Same PIN: highest priority local match
            {
              $multiply: [
                "$samePin",
                200000,
              ],
            },

            // Same city
            {
              $multiply: [
                "$sameCity",
                150000,
              ],
            },

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

        hasDistance: {
          $cond: [{ $ne: ["$distance", null] }, 1, 0],
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

        // Nearest distance when available
        hasDistance: -1,
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