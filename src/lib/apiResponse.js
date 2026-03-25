import { NextResponse } from "next/server";

/**
 * Standard API Response Formatter
 */
export const apiResponse = {
  success: (message, data = null, status = 200) => {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  },

  error: (message, status = 400, data = null) => {
    return NextResponse.json(
      {
        success: false,
        message,
        data,
      },
      { status }
    );
  },
};

/**
 * Higher-order function to wrap API handlers with error handling.
 */
export function withErrorHandler(handler) {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      console.error("API Error:", error);
      
      // Handle known error types if needed (e.g. Zod, Mongoose)
      if (error.name === "ValidationError") {
        return apiResponse.error("Validation failed", 400, error.errors);
      }

      if (error.name === "CastError") {
        return apiResponse.error("Invalid ID format", 400);
      }

      return apiResponse.error(
        process.env.NODE_ENV === "development" ? error.message : "Internal Server Error",
        500
      );
    }
  };
}
