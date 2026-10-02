import advertisementModel from '../models/advertisement.model.ts';

// ==============================
// Create Advertisement
// ==============================

export const createAdvertisementRepository = async (advertisementData: any) => {
  return await advertisementModel.create(advertisementData);
};

// ==============================
// Find Advertisement By ID
// ==============================

export const findAdvertisementByIdRepository = async (advertisementId: string) => {
  return await advertisementModel.findById(advertisementId);
};

// ==============================
// Update Advertisement
// ==============================   

export const updateAdvertisementRepository = async (advertisementId: string, advertisementData: any) => {
  return await advertisementModel.findByIdAndUpdate(advertisementId, advertisementData, { new: true });
};

// ==============================
// Delete Advertisement
// ==============================

export const deleteAdvertisementRepository = async (advertisementId: string) => {
  return await advertisementModel.findByIdAndDelete(advertisementId);
};

// ==============================
// Display Advertisements
// ==============================

export const findAdvertisementsRepository = async (filter: any = {}, skip = 0, limit = 10) => {
  const query = {
    ...filter,
  };

  return await advertisementModel.find(query).skip(skip).limit(limit);
};