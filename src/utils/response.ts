import type { Request, Response } from "express";
import ApiError, { ErrorResponse } from "./ApiError.js";

export { ApiError, ErrorResponse };

export const successResponse = (
  res: Response,
  message: string,
  data: any = null,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(Number(page) || 1, 1);
  const pageLimit = Math.max(Number(limit) || 10, 1);

  return {
    page: currentPage,
    limit: pageLimit,
    skip: (currentPage - 1) * pageLimit,
  };
};

export const paginationResponse = (
  res: Response,
  message: string,
  data: any,
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};