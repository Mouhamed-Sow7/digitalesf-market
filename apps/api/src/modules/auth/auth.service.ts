import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { RegisterPayload, LoginPayload } from "@digitalesf/shared";
import { authRepository } from "./auth.repository";
import { AppError } from "../../core/middlewares/error-handler";

interface TokenSecrets {
  accessSecret: string;
  refreshSecret: string;
}

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = "30d";

export function createAuthService(secrets: TokenSecrets) {
  function signTokens(userId: string, role: "seller" | "admin") {
    const accessToken = jwt.sign({ userId, role }, secrets.accessSecret, { expiresIn: ACCESS_TOKEN_TTL });
    const refreshToken = jwt.sign({ userId, role }, secrets.refreshSecret, { expiresIn: REFRESH_TOKEN_TTL });
    return { accessToken, refreshToken };
  }

  return {
    async register(payload: RegisterPayload) {
      const existing = await authRepository.findByEmail(payload.email);
      if (existing) {
        throw new AppError(409, "Un compte existe déjà avec cet email", "email_taken");
      }
      const passwordHash = await argon2.hash(payload.password);
      const user = await authRepository.create({
        email: payload.email,
        passwordHash,
        country: payload.country,
        displayName: payload.displayName,
      });
      return { user, tokens: signTokens(user.id, user.role) };
    },

    async login(payload: LoginPayload) {
      const user = await authRepository.findByEmail(payload.email);
      if (!user || !user.passwordHash) {
        throw new AppError(401, "Identifiants invalides", "invalid_credentials");
      }
      const valid = await argon2.verify(user.passwordHash, payload.password);
      if (!valid) {
        throw new AppError(401, "Identifiants invalides", "invalid_credentials");
      }
      return { user, tokens: signTokens(user.id, user.role) };
    },

    async me(userId: string) {
      const user = await authRepository.findById(userId);
      if (!user) {
        throw new AppError(404, "Utilisateur introuvable", "not_found");
      }
      return user;
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
