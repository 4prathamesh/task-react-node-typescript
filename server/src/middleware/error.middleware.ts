import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/catchAsync';

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error: ', err);
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

      // JWT invalid
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    }

    // JWT expired
    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }

    // Mongoose validation
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors)
        .map((e: any) => e.message)
        .join(", ");
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message
    });
};