import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AppConfig } from "../../core/config/config.schema";

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export function createAuthController(authService: AuthService, config: AppConfig) {
  function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie("access_token", tokens.accessToken, {
      ...COOKIE_BASE,
      domain: config.COOKIE_DOMAIN,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      ...COOKIE_BASE,
      domain: config.COOKIE_DOMAIN,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/auth/refresh",
    });
  }

  return {
    async register(req: Request, res: Response) {
      const { user, tokens } = await authService.register(req.body);
      setAuthCookies(res, tokens);
      res.status(201).json({ id: user.id, email: user.email, profile: user.profile });
    },

    async login(req: Request, res: Response) {
      const { user, tokens } = await authService.login(req.body);
      setAuthCookies(res, tokens);
      res.status(200).json({ id: user.id, email: user.email, profile: user.profile });
    },

    async logout(_req: Request, res: Response) {
      res.clearCookie("access_token", { domain: config.COOKIE_DOMAIN });
      res.clearCookie("refresh_token", { domain: config.COOKIE_DOMAIN, path: "/auth/refresh" });
      res.status(204).send();
    },

    async me(req: Request, res: Response) {
      const user = await authService.me(req.auth!.userId);
      res.status(200).json({ id: user.id, email: user.email, profile: user.profile });
    },
  };
}
