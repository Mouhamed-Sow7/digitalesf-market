import { Router } from "express";
import rateLimit from "express-rate-limit";
import { RegisterPayloadSchema, LoginPayloadSchema } from "@digitalesf/shared";
import { validateBody } from "../../core/middlewares/validate";
import { requireAuth } from "../../core/middlewares/require-auth";
import { createAuthController } from "./auth.controller";
import { createAuthService } from "./auth.service";
import { AppConfig } from "../../core/config/config.schema";

// Plus strict que le reste de l'API : /auth est la cible n°1 des attaques par bruteforce.
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

export function createAuthRouter(config: AppConfig): Router {
  const router = Router();
  const authService = createAuthService({
    accessSecret: config.JWT_ACCESS_SECRET,
    refreshSecret: config.JWT_REFRESH_SECRET,
  });
  const controller = createAuthController(authService, config);

  router.use(authRateLimit);

  router.post("/register", validateBody(RegisterPayloadSchema), (req, res, next) =>
    controller.register(req, res).catch(next),
  );
  router.post("/login", validateBody(LoginPayloadSchema), (req, res, next) =>
    controller.login(req, res).catch(next),
  );
  router.post("/logout", (req, res, next) => controller.logout(req, res).catch(next));
  router.get("/me", requireAuth(config.JWT_ACCESS_SECRET), (req, res, next) =>
    controller.me(req, res).catch(next),
  );

  return router;
}
