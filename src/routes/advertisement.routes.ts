import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.ts';
import authorize from '../middlewares/authorize.middleware.ts';
import upload from '../middlewares/upload.middleware.ts';
import { addAdvertisement, deleteAdvertisement, displayAdvertisement, displayAdvertisementById, editAdvertisement } from '../controllers/advertisement.controller.ts';

const router = express.Router();

router.post(
  "/v2",
  authMiddleware,
  authorize("Admin"),
  upload.single("images"),
  addAdvertisement
);
router.get(
  "/v2",
  authMiddleware,
  authorize("Admin", "User"),
    displayAdvertisement);

    router.get(
  "/v2/:advertisementId",
  authMiddleware,
  authorize("Admin", "User"),
    displayAdvertisementById);

router.patch(
  "/v2/:advertisementId",
  authMiddleware,
  authorize("Admin"),
  upload.fields([
    {
      name: "images",
      maxCount: 1,
    },
  ]),
  editAdvertisement
);

router.delete(
  "/v2/:advertisementId",
  authMiddleware,
  authorize("Admin"),
  deleteAdvertisement
);

export default router;