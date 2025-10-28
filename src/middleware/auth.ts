import { NextFunction, Request, Response } from "express";
import { JWTPayload, verifyToken } from "../utils/jwt";
import { sendError } from "../utils/response";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "UNAUTHORIZED", "No token provided", 401);
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, "UNAUTHORIZED", "Invalid or expired token", 401);
  }
};

export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    next();
  }
};
