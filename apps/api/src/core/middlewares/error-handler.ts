import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../config/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "validation_error",
      details: err.flatten().fieldErrors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code ?? "app_error", message: err.message });
  }

  logger.error({ err, path: req.path }, "Unhandled error");
  return res.status(500).json({ error: "internal_error", message: "Une erreur interne est survenue" });
};
