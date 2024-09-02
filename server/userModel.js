import { Schema, model } from "mongoose";
import { locationSchema } from "./roomModel.js";

const favListSchema = new Schema({
  listName: { type: String },
  favouriteRooms: [{ type: Schema.Types.ObjectId, ref: "Room" }],
});
const autoBookingsResp = new Schema({
  type: { type: String, enum: ["ACCEPT", "REJECT"] },
  status: { type: Boolean, default: false },
});
const socialSchema = new Schema({
  socialId: { type: String },
  socialPlatform: { type: String },
});
const FcmSchema = new Schema({
  deviceId: { type: String },
  fcmToken: { type: String },
});

const userSchema = new Schema(
  {
    cognitoSub: {
      type: String,
      unique: true,
      nullable: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    role: {
      type: String,
      required: true,
      lowercase: true,
    },
    socialId: {
      type: String,
      default: null,
    },
    socialPlatform: {
      type: String,
      lowercase: true,
      default: null,
    },
    profileImage: {
      type: String,
    },
    isAccountDeleted: { type: Boolean, default: false },
    favouriteList: [favListSchema],
    location: { type: locationSchema, _id: false },
    isBanned: { type: Boolean, default: false },
    stripeId: { type: String },
    stripeHostAcc: { type: String },
    stripeHostStatus: { type: String },
    phoneNum: { type: String },
    autoBookingsResp: {
      type: autoBookingsResp,
      _id: false,
    },
    notification: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      default: "notVerified",
      enum: [
        "notVerified",
        "verificationRejected",
        "verificationApproved",
        "verificationPending",
      ],
    },
    verificationDocuments: [
      {
        type: String,
      },
    ],
    social: [
      {
        type: socialSchema,
        _id: false,
      },
    ],
    fcm: [FcmSchema],
  },
  {
    timestamps: true,
    autoIndex: false,
  }
);

userSchema.index({ "autoBookingsResp.status": 1 });
userSchema.index({ location: "2dsphere" }); // INDEX FOR GEOSPATIAL QUERIES

export const User = model("User", userSchema);

export const getUsers = () => User.find();

export const getUserByEmail = (email) => User.findOne({ email });

export const getUserById = (id) => User.findOne({ _id: id });

export const deleteUserById = (id) => User.findByIdAndDelete(id);
export const updateUserById = (id, values) =>
  User.findByIdAndUpdate(id, values, { new: true });
