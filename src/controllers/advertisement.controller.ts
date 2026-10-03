import type { Request, Response } from "express";
import {
  createAdvertisementRepository,
  deleteAdvertisementRepository,
  findAdvertisementByIdRepository,
  findAdvertisementsRepository,
  updateAdvertisementRepository,
} from "../repositories/advertisement.repository.ts";
import asyncHandler from "../utils/asyncHandler.ts";
import { ApiError, successResponse } from "../utils/response.ts";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/cloudinary.ts";

export const addAdvertisement = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw ApiError.badRequest("Advertisement image is required");
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadToCloudinary(
      req.file,
      "advertisements"
    );

    // Prepare advertisement data
    const advertisementData = {
      ...req.body,
      advImg: uploadedImage.url,
    };

    // Save advertisement in database
    const newAdvertisement =
      await createAdvertisementRepository(advertisementData);

    return successResponse(
      res,
      "Advertisement created successfully",
      newAdvertisement,
      201
    );
  }
);

export const displayAdvertisement = asyncHandler(
  async (req: Request, res: Response) => {
    const advertisements = await findAdvertisementsRepository();

    return successResponse(
      res,
      "Advertisements retrieved successfully",
      advertisements
    );
  }
);

export const displayAdvertisementById = asyncHandler(
  async (
    req: Request,
    res: Response
  ) => {
    const advertisementId = String(req.params.advertisementId);

    const advertisement =
      await findAdvertisementByIdRepository(advertisementId);

    if (!advertisement) {
      throw ApiError.notFound("Advertisement not found");
    }

    return successResponse(
      res,
      "Advertisement retrieved successfully",
      advertisement
    );
  }
);

export const editAdvertisement = asyncHandler(
  async (req: Request, res: Response) => {
    const advertisementId = String(req.params.advertisementId);

    const existingAdvertisement =
      await findAdvertisementByIdRepository(advertisementId);

    if (!existingAdvertisement) {
      throw ApiError.notFound("Advertisement not found");
    }

    const advertisementData = {
      ...req.body,
    };

    if (req.file) {
      // Delete old image from Cloudinary
      if (existingAdvertisement.advImgPublicId) {
        await deleteFromCloudinary(
          existingAdvertisement.advImgPublicId,
          "image"
        );
      }

      // Upload new image to Cloudinary
      const uploadedImage = await uploadToCloudinary(
        req.file,
        "advertisements"
      );

      advertisementData.advImg = uploadedImage.url;
      advertisementData.advImgPublicId = uploadedImage.publicId;
    }

    const updatedAdvertisement =
      await updateAdvertisementRepository(
        advertisementId,
        advertisementData
      );

    return successResponse(
      res,
      "Advertisement updated successfully",
      updatedAdvertisement
    );
  }
);

export const deleteAdvertisement = asyncHandler(
  async (req: Request, res: Response) => {
    const advertisementId = String(req.params.advertisementId);

    // Find advertisement first
    const advertisement =
      await findAdvertisementByIdRepository(advertisementId);

    if (!advertisement) {
      throw ApiError.notFound("Advertisement not found");
    }

    // Delete image from Cloudinary
    if (advertisement.advImgPublicId) {
      await deleteFromCloudinary(
        advertisement.advImgPublicId,
        "image"
      );
    }

    // Delete advertisement from MongoDB
    const deletedAdvertisement =
      await deleteAdvertisementRepository(advertisementId);

    return successResponse(
      res,
      "Advertisement deleted successfully",
      deletedAdvertisement
    );
  }
);