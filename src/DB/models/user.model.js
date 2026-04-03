export const users = [];

import mongoose from "mongoose";
import { GenderEnum, ProviderEnum } from "../../common/enums/index.js";
const userSchema = new mongoose.Schema(
  {
    oldPassword:[String],
    firstName: {
      type: String,
      required: true,
      minLength: [
        2,
        "FirstName connot be less than 2 char but you have entered a {VALUE}",
      ],
      maxLength: 25,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      minLength: [
        2,
        "lastName connot be less than 2 char but you have entered a {VALUE}",
      ],
      maxLength: 25,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: String,

    confirmEmail: Date,
    changeCredentialsTime: Date,
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    profilePicture: String,
    coverProfilePictures: [String],
  },
  {
    collection: "Route_Users",
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

  
export const UserModel =
  mongoose.models.Users || mongoose.model("User", userSchema);
