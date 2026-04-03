import mongoose, { Schema, model } from "mongoose";

const tokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    token: { 
      type: String, 
      required: true,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const tokenModel = mongoose.models.Token || model("Token", tokenSchema);