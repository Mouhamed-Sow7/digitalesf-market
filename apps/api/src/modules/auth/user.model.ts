import { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document {
  email: string;
  passwordHash?: string;
  authProvider: "email" | "google";
  country: string;
  role: "seller" | "admin";
  profile: { displayName: string; bio?: string; avatarRef?: string };
  createdAt: Date;
  updatedAt: Date;
}

const UserMongooseSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    passwordHash: { type: String },
    authProvider: { type: String, enum: ["email", "google"], required: true },
    country: { type: String, required: true },
    role: { type: String, enum: ["seller", "admin"], default: "seller" },
    profile: {
      displayName: { type: String, required: true },
      bio: String,
      avatarRef: String,
    },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>("User", UserMongooseSchema);
