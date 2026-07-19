import { UserModel, UserDocument } from "./user.model";

export const authRepository = {
  findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  },

  create(data: {
    email: string;
    passwordHash: string;
    country: string;
    displayName: string;
  }): Promise<UserDocument> {
    return UserModel.create({
      email: data.email,
      passwordHash: data.passwordHash,
      authProvider: "email",
      country: data.country,
      profile: { displayName: data.displayName },
    });
  },

  findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  },
};
