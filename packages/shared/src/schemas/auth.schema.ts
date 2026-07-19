import { z } from "zod";

/**
 * Sprint 1 : email/password uniquement. Google OAuth ajouté en sprint 2 (cf. décision CTO).
 */
export const RegisterPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "8 caractères minimum"),
  displayName: z.string().min(2).max(80),
  country: z.string().min(2).max(2),
});

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  // le refresh token n'est jamais renvoyé dans le body JSON : il vit uniquement
  // en cookie httpOnly, posé par le serveur. Ce schéma documente juste sa présence logique.
});

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
