import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import fs from "fs";
import type { Express } from "express";

import env from "../config/env.js";

// ======================================================
// Cloudinary Configuration
// ======================================================

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// ======================================================
// Types
// ======================================================

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType: string;
}

type UploadFile = string | Express.Multer.File;

// ======================================================
// Upload File to Cloudinary
// ======================================================

export const uploadToCloudinary = async (
  fileOrPath: UploadFile,
  folder = "joms"
): Promise<CloudinaryUploadResult> => {
  if (!fileOrPath) {
    throw new Error("No file provided for upload");
  }

  // ====================================================
  // Multer MemoryStorage - Buffer
  // ====================================================

  if (
    typeof fileOrPath === "object" &&
    "buffer" in fileOrPath &&
    fileOrPath.buffer
  ) {
    return new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: "auto",
            },
            (error, result) => {
              if (error) {
                return reject(
                  new Error(
                    `Cloudinary upload failed: ${error.message}`
                  )
                );
              }

              if (!result) {
                return reject(
                  new Error(
                    "Cloudinary upload failed: No result returned"
                  )
                );
              }

              resolve({
                url: result.secure_url,
                publicId: result.public_id,
                resourceType: result.resource_type,
              });
            }
          );

        Readable.from(fileOrPath.buffer).pipe(
          uploadStream
        );
      }
    );
  }

  // ====================================================
  // Local File Path
  // ====================================================

  const filePath =
    typeof fileOrPath === "string"
      ? fileOrPath
      : fileOrPath.path;

  if (!filePath) {
    throw new Error(
      "Invalid file format provided for upload"
    );
  }

  try {
    const result =
      await cloudinary.uploader.upload(
        filePath,
        {
          folder,
          resource_type: "auto",
        }
      );

    // ==================================================
    // Remove local file after successful upload
    // ==================================================

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
    };
  } catch (error: unknown) {
    // ==================================================
    // Remove local file even if upload fails
    // ==================================================

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (error instanceof Error) {
      throw new Error(
        `Cloudinary upload failed: ${error.message}`
      );
    }

    throw new Error(
      "Cloudinary upload failed"
    );
  }
};

// ======================================================
// Delete File from Cloudinary
// ======================================================

export const deleteFromCloudinary = async (
  publicId: string,
  resourceType:
    | "image"
    | "video"
    | "raw" = "image"
) => {
  if (!publicId) {
    return null;
  }

  try {
    return await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
      }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(
        `Cloudinary delete failed: ${error.message}`
      );
    }

    throw new Error(
      "Cloudinary delete failed"
    );
  }
};

// ======================================================
// Export Cloudinary Instance
// ======================================================

export default cloudinary;