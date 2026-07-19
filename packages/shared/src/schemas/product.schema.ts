import { z } from "zod";

export const ProductStatusSchema = z.enum(["draft", "published", "archived"]);

export const GrowthScoreFactorSchema = z.object({
  key: z.string(), // ex: "thumbnail_quality"
  label: z.string(), // ex: "Votre thumbnail manque d'impact"
  impact: z.enum(["HIGH", "MEDIUM", "GOOD"]),
  passed: z.boolean(),
});

export const GrowthScoreSchema = z.object({
  value: z.number().min(0).max(100),
  breakdown: z.array(GrowthScoreFactorSchema),
  calculatedAt: z.date().optional(),
});

export const SeoMetaSchema = z.object({
  slug: z.string().min(3),
  metaDescription: z.string().max(160).optional(),
});

// Création : pas encore de fichier/growthScore (ajoutés après upload / calcul)
export const CreateProductPayloadSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(5000).default(""),
  priceAmount: z.number().positive(),
  priceCurrency: z.string().length(3), // ISO 4217, ex: "EUR"
  category: z.string().min(2),
});

export const ProductSchema = CreateProductPayloadSchema.extend({
  id: z.string().optional(),
  sellerId: z.string(),
  fileRef: z.string().optional(),
  imageRef: z.string().optional(),
  videoRef: z.string().optional(),
  status: ProductStatusSchema.default("draft"),
  seoMeta: SeoMetaSchema.optional(),
  growthScore: GrowthScoreSchema.optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductPayload = z.infer<typeof CreateProductPayloadSchema>;
export type GrowthScore = z.infer<typeof GrowthScoreSchema>;
export type GrowthScoreFactor = z.infer<typeof GrowthScoreFactorSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
