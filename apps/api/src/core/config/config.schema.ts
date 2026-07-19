import { z } from "zod";

/**
 * Le serveur refuse de démarrer si une variable requise manque ou est mal typée.
 * Préférable à un crash silencieux en production.
 */
const ConfigSchema = z.object({
  NODE_ENV: z.enum(["local", "staging", "production"]).default("local"),
  PORT: z.coerce.number().default(4000),
  MONGO_URI: z.string().min(1, "MONGO_URI est requis"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET doit faire au moins 16 caractères"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET doit faire au moins 16 caractères"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  CORS_ORIGIN: z.string().default("http://localhost:4200"),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(): AppConfig {
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("❌ Configuration invalide :", parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
