import { Types } from "mongoose";

import {
  createPostRepository,
  deletePostRepository,
  displayRecommendedPostsRepository,
  findPostByIdRepository,
  findPostsRepository,
  updatePostRepository,
} from "../repositories/post.repository.ts";

import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.ts";

import ApiError from "../utils/ApiError.ts";

// ======================================================
// Types
// ======================================================

interface Media {
  url: string;
  mediaId: string;
}

export interface UploadedFiles {
  images?: Express.Multer.File[];
  videos?: Express.Multer.File[];
}

interface PostData {
  description?: unknown;

  locationLink?: unknown;

  food?: unknown;

  maritalStatus?: unknown;

  profession?: unknown;

  religion?: unknown;

  genderPreference?: unknown;

  minAge?: unknown;

  maxAge?: unknown;

  problems?: unknown;

  imageMediaIds?: unknown;

  videoMediaIds?: unknown;

  [key: string]: unknown;
}

interface PostFilter {
  userId?: string | Types.ObjectId;
  isActive?: boolean;
}

// ======================================================
// Helper: Upload Images
// ======================================================

const uploadImages = async (
  files: Express.Multer.File[] = []
): Promise<Media[]> => {
  const images: Media[] = [];

  for (const file of files) {
    const result = await uploadToCloudinary(
      file,
      "joms/posts/images"
    );

    images.push({
      url: result.url,
      mediaId: result.publicId,
    });
  }

  return images;
};

// ======================================================
// Helper: Upload Videos
// ======================================================

const uploadVideos = async (
  files: Express.Multer.File[] = []
): Promise<Media[]> => {
  const videos: Media[] = [];

  for (const file of files) {
    const result = await uploadToCloudinary(
      file,
      "joms/posts/videos"
    );

    videos.push({
      url: result.url,
      mediaId: result.publicId,
    });
  }

  return videos;
};

// ======================================================
// Helper: Delete Media
// ======================================================

const deleteMedia = async (
  media: Media[] = []
): Promise<void> => {
  for (const item of media) {
    if (!item?.mediaId) {
      continue;
    }

    try {
      await deleteFromCloudinary(item.mediaId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(
          "Cloudinary delete error:",
          item.mediaId,
          error.message
        );
      } else {
        console.error(
          "Cloudinary delete error:",
          item.mediaId,
          error
        );
      }
    }
  }
};

// ======================================================
// CREATE POST
// ======================================================

export const createPostService = async (
  userId: string,
  postData: PostData = {},
  files: UploadedFiles = {}
) => {
  const uploadedImages: Media[] = [];
  const uploadedVideos: Media[] = [];

  try {
    // ------------------------------------------
    // Upload Images
    // ------------------------------------------

    if (files.images?.length) {
      const images = await uploadImages(files.images);

      uploadedImages.push(...images);
    }

    // ------------------------------------------
    // Upload Videos
    // ------------------------------------------

    if (files.videos?.length) {
      const videos = await uploadVideos(files.videos);

      uploadedVideos.push(...videos);
    }

    // ------------------------------------------
    // Create MongoDB Post
    // ------------------------------------------

    const post = await createPostRepository({
      userId,

      description:
        typeof postData.description === "string"
          ? postData.description.trim()
          : "",

      locationLink:
        typeof postData.locationLink === "string"
          ? postData.locationLink.trim()
          : "",

      food: postData.food,

      maritalStatus: postData.maritalStatus,

      profession: postData.profession,

      religion: postData.religion,

      genderPreference:
        postData.genderPreference,

      minAge: postData.minAge,

      maxAge: postData.maxAge,

      problems: postData.problems,

      images: uploadedImages,

      videos: uploadedVideos,
    });

    return post;
  } catch (error: unknown) {
    // ------------------------------------------
    // MongoDB failed after Cloudinary upload
    // ------------------------------------------

    await deleteMedia(uploadedImages);
    await deleteMedia(uploadedVideos);

    throw error;
  }
};

// ======================================================
// EDIT POST
// ======================================================

export const editPostService = async (
  userId: string,
  postId: string,
  updateData: PostData = {},
  files: UploadedFiles = {}
) => {
  // ==========================================
  // Find Post
  // ==========================================

  const existingPost =
    await findPostByIdRepository(postId);

  if (!existingPost) {
    throw ApiError.notFound("Post not found");
  }

  // ==========================================
  // Check Owner
  // ==========================================

  if (
    existingPost.userId.toString() !==
    userId.toString()
  ) {
    throw ApiError.forbidden(
      "You are not allowed to edit this post"
    );
  }

  // ==========================================
  // Check Updates
  // ==========================================

  const hasDescription =
    Object.prototype.hasOwnProperty.call(
      updateData,
      "description"
    );

  const hasImages =
    Array.isArray(files.images) &&
    files.images.length > 0;

  const hasVideos =
    Array.isArray(files.videos) &&
    files.videos.length > 0;

  const hasOtherFields =
    Object.keys(updateData).some(
      (key) =>
        ![
          "description",
          "imageMediaIds",
          "videoMediaIds",
        ].includes(key)
    );

  if (
    !hasDescription &&
    !hasImages &&
    !hasVideos &&
    !hasOtherFields
  ) {
    throw ApiError.badRequest(
      "Please provide something to update"
    );
  }

  // ==========================================
  // Prepare MongoDB Update
  // ==========================================

  const postData: Record<string, unknown> = {};

  // ==========================================
  // Description
  // ==========================================

  if (hasDescription) {
    const description =
      typeof updateData.description === "string"
        ? updateData.description.trim()
        : "";

    if (!description) {
      throw ApiError.badRequest(
        "Description cannot be empty"
      );
    }

    postData.description = description;
  }

  // ==========================================
  // Other Fields
  // ==========================================

  const allowedFields = [
    "locationLink",
    "food",
    "maritalStatus",
    "profession",
    "religion",
    "genderPreference",
    "minAge",
    "maxAge",
    "problems",
  ];

  for (const field of allowedFields) {
    if (
      Object.prototype.hasOwnProperty.call(
        updateData,
        field
      )
    ) {
      postData[field] = updateData[field];
    }
  }

  // ==========================================
  // IMAGE MEDIA IDs
  // ==========================================

  let imageMediaIds: unknown[] = [];

  if (hasImages) {
    let mediaIds = updateData.imageMediaIds;

    if (typeof mediaIds === "string") {
      try {
        mediaIds = JSON.parse(mediaIds);
      } catch {
        throw ApiError.badRequest(
          "imageMediaIds must be a valid JSON array"
        );
      }
    }

    if (!Array.isArray(mediaIds)) {
      throw ApiError.badRequest(
        "imageMediaIds must be an array"
      );
    }

    imageMediaIds = mediaIds;

    if (
      imageMediaIds.length !==
      files.images!.length
    ) {
      throw ApiError.badRequest(
        "Number of imageMediaIds must match number of images"
      );
    }
  }

  // ==========================================
  // VIDEO MEDIA IDs
  // ==========================================

  let videoMediaIds: unknown[] = [];

  if (hasVideos) {
    let mediaIds = updateData.videoMediaIds;

    if (typeof mediaIds === "string") {
      try {
        mediaIds = JSON.parse(mediaIds);
      } catch {
        throw ApiError.badRequest(
          "videoMediaIds must be a valid JSON array"
        );
      }
    }

    if (!Array.isArray(mediaIds)) {
      throw ApiError.badRequest(
        "videoMediaIds must be an array"
      );
    }

    videoMediaIds = mediaIds;

    if (
      videoMediaIds.length !==
      files.videos!.length
    ) {
      throw ApiError.badRequest(
        "Number of videoMediaIds must match number of videos"
      );
    }
  }

  // ==========================================
  // Copy Existing Media
  // ==========================================

  const updatedImages: Media[] = [
    ...(existingPost.images || []),
  ];

  const updatedVideos: Media[] = [
    ...(existingPost.videos || []),
  ];

  const oldImages: Media[] = [];
  const oldVideos: Media[] = [];

  // ==========================================
  // Upload Multiple Images
  // ==========================================

  if (hasImages) {
    const uploadedImages =
      await uploadImages(files.images!);

    try {
      for (
        let i = 0;
        i < imageMediaIds.length;
        i++
      ) {
        const mediaId = String(
          imageMediaIds[i] ?? ""
        ).trim();

        if (!mediaId) {
          throw ApiError.badRequest(
            `imageMediaIds[${i}] is required`
          );
        }

        const imageIndex =
          updatedImages.findIndex(
            (image) =>
              image.mediaId === mediaId
          );

        if (imageIndex === -1) {
          throw ApiError.notFound(
            `Image not found: ${mediaId}`
          );
        }

        const existingImage = updatedImages[imageIndex];
        const newImage = uploadedImages[i];
        if (existingImage && newImage) {
          oldImages.push(existingImage);
          updatedImages[imageIndex] = newImage;
        }
      }
    } catch (error: unknown) {
      await deleteMedia(uploadedImages);
      throw error;
    }

    postData.images = updatedImages;
  }

  // ==========================================
  // Upload Multiple Videos
  // ==========================================

  if (hasVideos) {
    const uploadedVideos =
      await uploadVideos(files.videos!);

    try {
      for (
        let i = 0;
        i < videoMediaIds.length;
        i++
      ) {
        const mediaId = String(
          videoMediaIds[i] ?? ""
        ).trim();

        if (!mediaId) {
          throw ApiError.badRequest(
            `videoMediaIds[${i}] is required`
          );
        }

        const videoIndex =
          updatedVideos.findIndex(
            (video) =>
              video.mediaId === mediaId
          );

        if (videoIndex === -1) {
          throw ApiError.notFound(
            `Video not found: ${mediaId}`
          );
        }

        const existingVideo = updatedVideos[videoIndex];
        const newVideo = uploadedVideos[i];
        if (existingVideo && newVideo) {
          oldVideos.push(existingVideo);
          updatedVideos[videoIndex] = newVideo;
        }
      }
    } catch (error: unknown) {
      await deleteMedia(uploadedVideos);
      throw error;
    }

    postData.videos = updatedVideos;
  }

  // ==========================================
  // Update MongoDB
  // ==========================================

  const updatedPost =
    await updatePostRepository(
      postId,
      postData
    );

  if (!updatedPost) {
    throw ApiError.notFound(
      "Post not found"
    );
  }

  // ==========================================
  // Delete Old Images
  // ==========================================

  if (oldImages.length > 0) {
    await deleteMedia(oldImages);
  }

  // ==========================================
  // Delete Old Videos
  // ==========================================

  if (oldVideos.length > 0) {
    await deleteMedia(oldVideos);
  }

  return updatedPost;
};

// ======================================================
// DELETE POST
// ======================================================

export const deletePostService = async (
  userId: string,
  postId: string
): Promise<boolean> => {
  // ------------------------------------------
  // Find Post
  // ------------------------------------------

  const existingPost =
    await findPostByIdRepository(postId);

  if (!existingPost) {
    throw ApiError.notFound(
      "Post not found"
    );
  }

  // ------------------------------------------
  // Check Owner
  // ------------------------------------------

  if (
    existingPost.userId.toString() !==
    userId.toString()
  ) {
    throw ApiError.forbidden(
      "You are not allowed to delete this post"
    );
  }

  // ------------------------------------------
  // Delete MongoDB Post First
  // ------------------------------------------

  await deletePostRepository(postId);

  // ------------------------------------------
  // Delete Images
  // ------------------------------------------

  await deleteMedia(
    existingPost.images || []
  );

  // ------------------------------------------
  // Delete Videos
  // ------------------------------------------

  await deleteMedia(
    existingPost.videos || []
  );

  return true;
};

// ======================================================
// DISPLAY POSTS
// ======================================================

export type PostType =
  | "my"
  | "all"
  | "friends";

export const displayPostsService = async (
  userId: string,
  type: PostType,
  page: number,
  limit: number
) => {
  let filter: PostFilter = {};

  // ------------------------------------------
  // My Posts
  // ------------------------------------------

  if (type === "my") {
    filter.userId = userId;
  }

  // ------------------------------------------
  // All Posts
  // ------------------------------------------

  if (type === "all") {
    filter = {};
  }

  // ------------------------------------------
  // Friends Posts
  // ------------------------------------------

  if (type === "friends") {
    throw ApiError.badRequest(
      "Friends post functionality is not implemented yet"
    );
  }

  // ------------------------------------------
  // Pagination
  // ------------------------------------------

  const skip = (page - 1) * limit;

  return await findPostsRepository(
    filter,
    skip,
    limit
  );
};


import { findReportedPostIdsByUserRepository } from "../repositories/report.repository.ts";
import { getUserLocation } from "../clients/user.clients.ts";


export const displayRecommendedPostsService = async (
  userId: string,
  page: number,
  limit: number
) => {
  // ==========================================
  // 1. Get user location from Auth service
  // ==========================================

  const user = await getUserLocation(userId);

  if (!user) {
    throw ApiError.notFound(
      "User profile not found"
    );
  }

  if (
    user.latitude === undefined ||
    user.longitude === undefined
  ) {
    throw ApiError.badRequest(
      "User location is not available"
    );
  }

  // ==========================================
  // 2. Get posts reported by this user
  // ==========================================

  const reportedPostIds =
    await findReportedPostIdsByUserRepository(
      userId
    );

  // ==========================================
  // 3. Get recommended posts
  // ==========================================

  return await displayRecommendedPostsRepository({
    userId,
    latitude: user.latitude,
    longitude: user.longitude,
    district: user.district ?? "",
    state: user.state ?? "",
    reportedPostIds,
    page,
    limit,
  });
};