import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error-handler";

export interface AuthPayload {
  userId: string;
  role: "seller" | "admin";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

/**
 * Le JWT d'accès vit en cookie httpOnly (jamais localStorage, cf. PRD sécurité).
 */
export function requireAuth(accessSecret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.access_token;
    if (!token) {
      return next(new AppError(401, "Non authentifié", "unauthorized"));
    }
    try {
      const payload = jwt.verify(token, accessSecret) as AuthPayload;
      req.auth = payload;
      next();
    } catch {
      next(new AppError(401, "Token invalide ou expiré", "unauthorized"));
    }
  };
}
