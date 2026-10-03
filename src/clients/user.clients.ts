import axios, {
  type AxiosInstance,
} from "axios";

import env from "../config/env.ts";
import logger from "../utils/logger.ts";

/* ==============================
   Types
============================== */

export interface IUser {
  _id: string;
  username?: string;
  profileImage?: string;

  district?: string;
  state?: string;

  [key: string]: unknown;
}

export interface IUserLocation {
  userId: string;

  latitude?: number;
  longitude?: number;

  pin?: string;
  district?: string;
  state?: string;
  country?: string;
  city?: string;
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
}

/* ==============================
   Auth Client
============================== */

const authClient: AxiosInstance = axios.create({
  baseURL: env.AUTH_SERVICE_URL,
  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },
});

/* ==============================
   Get User By ID
============================== */

export const getUserById = async (
  userId: string
): Promise<IUser | null> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data } =
      await authClient.get<ApiResponse<IUser>>(
        `/api/user/v1/internal/${userId}`
      );

    return data?.data ?? null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }

      logger.error(
        "Failed to fetch user by ID",
        error.response?.data ?? error.message
      );
    }

    throw error;
  }
};

/* ==============================
   Get User Location
============================== */

export const getUserLocation = async (
  userId: string
): Promise<IUserLocation | null> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const { data } =
      await authClient.get<
        ApiResponse<IUserLocation>
      >(
        `/api/user/v1/internal/${userId}/location`
      );

    return data?.data ?? null;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return null;
      }

      logger.error(
        "Failed to fetch user location",
        error.response?.data ?? error.message
      );
    }

    throw error;
  }
};

/* ==============================
   Get Users By IDs
============================== */

export const getUsersByIds = async (
  userIds: string[]
): Promise<IUser[]> => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  try {
    const { data } =
      await authClient.post<ApiResponse<IUser[]>>(
        "/api/user/v1/internal/by-ids",
        {
          userIds,
        }
      );

    return data?.data ?? [];
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      logger.error(
        "Failed to fetch users by IDs",
        error.response?.data ?? error.message
      );
    }

    throw error;
  }
};

export default authClient;
