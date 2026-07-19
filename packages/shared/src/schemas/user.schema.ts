import { z } from "zod";

/**
 * Contrat unique pour l'entité User.
 * Utilisé côté API (validation des requêtes + Mongoose) et côté Angular (formulaires).
 */
export const UserRoleSchema = z.enum(["seller", "admin"]);

export const UserProfileSchema = z.object({
  displayName: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  avatarRef: z.string().optional(),
});

export const UserSchema = z.object({
  id: z.string().optional(), // absent à la création, présent en lecture
  email: z.string().email(),
  authProvider: z.enum(["email", "google"]),
  country: z.string().min(2).max(2), // ISO 3166-1 alpha-2
  role: UserRoleSchema.default("seller"),
  profile: UserProfileSchema,
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
