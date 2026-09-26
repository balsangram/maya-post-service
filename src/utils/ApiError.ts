class ApiError extends Error {
  statusCode: number;
  success: boolean;
  errors: unknown[];
  isOperational: boolean;

  constructor(
    statusCodeOrMessage: number | string,
    messageOrStatusCode: string | number = 500,
    errors: unknown[] | unknown = [],
    stack = ""
  ) {
    let statusCode = 500;
    let message = "Internal Server Error";

    // ApiError(statusCode, message, errors)
    if (typeof statusCodeOrMessage === "number") {
      statusCode = statusCodeOrMessage;

      if (typeof messageOrStatusCode === "string") {
        message = messageOrStatusCode;
      }
    }

    // ApiError(message, statusCode, errors)
    else if (typeof statusCodeOrMessage === "string") {
      message = statusCodeOrMessage;

      if (typeof messageOrStatusCode === "number") {
        statusCode = messageOrStatusCode;
      }
    }

    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.success = false;

    this.errors = Array.isArray(errors)
      ? errors
      : errors
        ? [errors]
        : [];

    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // ==========================================
  // 400 - Bad Request
  // ==========================================

  static badRequest(
    message = "Bad Request",
    errors: unknown[] | unknown = []
  ): ApiError {
    return new ApiError(400, message, errors);
  }

  // ==========================================
  // 401 - Unauthorized
  // ==========================================

  static unauthorized(
    message = "Unauthorized access"
  ): ApiError {
    return new ApiError(401, message);
  }

  // ==========================================
  // 403 - Forbidden
  // ==========================================

  static forbidden(
    message = "Forbidden access"
  ): ApiError {
    return new ApiError(403, message);
  }

  // ==========================================
  // 404 - Not Found
  // ==========================================

  static notFound(
    message = "Resource not found"
  ): ApiError {
    return new ApiError(404, message);
  }

  // ==========================================
  // 409 - Conflict
  // ==========================================

  static conflict(
    message = "Conflict with existing data"
  ): ApiError {
    return new ApiError(409, message);
  }

  // ==========================================
  // 500 - Internal Server Error
  // ==========================================

  static internal(
    message = "Internal Server Error",
    errors: unknown[] | unknown = []
  ): ApiError {
    return new ApiError(500, message, errors);
  }
}

// Alias
export const ErrorResponse = ApiError;

export default ApiError;