import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

/**
 * Valide req.body contre un schéma Zod AVANT que le controller ne touche
 * au service ou à la DB. Aucun payload non validé ne doit atteindre un service.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body); // lève une ZodError -> capturée par errorHandler
    next();
  };
}
