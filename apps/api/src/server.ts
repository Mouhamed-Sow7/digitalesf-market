import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { loadConfig } from "./core/config/config.schema";
import { logger } from "./core/config/logger";
import { connectMongo } from "./core/db/mongo";
import { errorHandler } from "./core/middlewares/error-handler";
import { createAuthRouter } from "./modules/auth/auth.routes";

async function bootstrap() {
  const config = loadConfig();

  await connectMongo(config.MONGO_URI);

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/auth", createAuthRouter(config));
  // apps/api/src/modules/products, /modules/ai, /modules/payments arrivent sprint 1 (suite) et 2

  app.use(errorHandler);

  app.listen(config.PORT, () => {
    logger.info(`🚀 API démarrée sur le port ${config.PORT} (${config.NODE_ENV})`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("❌ Échec du démarrage:", err);
  process.exit(1);
});
