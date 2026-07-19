import mongoose from "mongoose";
import { logger } from "../config/logger";

export async function connectMongo(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  logger.info("✅ MongoDB connecté");
}

/**
 * Wrapper pour toute écriture qui touche plusieurs collections liées à l'argent
 * (ex: orders + payments). Garantit l'atomicité via une transaction Mongo.
 */
export async function withTransaction<T>(fn: (session: mongoose.ClientSession) => Promise<T>): Promise<T> {
  const session = await mongoose.startSession();
  try {
    let result: T;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result!;
  } finally {
    await session.endSession();
  }
}
