import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    reviewerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    rating: { required: true, type: Number },
    description: { required: true, type: String },
    photos: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);
const checkingTimeSchema = new Schema({
  hour: { type: String, required: true },

  minute: { type: String, required: true },
});
const guestsAllowedSchema = new Schema({
  adults: { type: Number, required: true },
  children: { type: Number, required: true },
});
export const locationSchema = new Schema({
  type: { type: String, required: true },
  coordinates: {
    type: [Number], // An array of Numbers representing coordinates
    required: true, // Make coordinates required
    validate: {
      validator: function (value) {
        // Ensure that coordinates have exactly 2 elements (longitude and latitude)
        return Array.isArray(value) && value.length === 2;
      },
      message:
        "Coordinates must be an array with 2 elements (longitude and latitude).",
    },
  },
});

const discountSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: {
      values: ["On", "Off"],
      message: "{VALUE} is not supported",
    },
  },
  percentage: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        const intValue = Math.floor(value); // Round down to the nearest integer

        // Check if the value is an integer and within the desired range
        if (intValue === value && value >= 5 && value <= 90) {
          // Check if the integer value is a multiple of 5
          return intValue % 5 === 0;
        }

        return false;
      },
      message:
        "Discount must be an integer between 5 and 90, in increments of 5.",
    },
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
});

const customPolicySchema = new Schema({
  daysToCancelBefore: { required: true, type: Number },
  percentageToRefund: { required: true, type: Number },
});

const refundPolicySchema = new Schema({
  title: { type: String, required: true },
  custom: { type: [customPolicySchema], _id: false },
});

const roomModel = new Schema(
  {
    discount: { type: discountSchema, _id: false },
    description: {
      title: { type: String, required: true },
      body: { type: String, required: true },
      roomType: { type: String, required: true },
    },
    amenities: [
      {
        type: Schema.Types.ObjectId,
        ref: "Amenity",
        required: true,
      },
    ],
    rules: {
      type: String,
    },
    locationValue: {
      required: true,
      type: String,
    },
    location: { type: locationSchema, required: true, _id: false },
    address: { type: String },
    city: { type: String, required: true },
    country: { type: String, required: true },
    pricing: {
      type: Number,
      required: true,
    },
    availability: {
      type: {
        notAvailable: {
          type: Object,
          year: {
            type: Object,
            required: true,
          },
        },
      },
      required: false,
      _id: false,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    photos: [
      {
        type: String,
      },
    ],
    reviews: { type: [reviewSchema] },
    averageRating: { type: Number, default: 0 },
    checkInTime: {
      type: checkingTimeSchema,
      required: true,
      _id: false,
    },
    checkOutTime: { type: checkingTimeSchema, required: true, _id: false },
    guestsAllowed: { type: guestsAllowedSchema, required: true, _id: false },
    hasBabyCot: { type: Boolean },
    isClosed: { type: Boolean },
    refundPolicy: {
      type: refundPolicySchema,
      required: true,
      _id: false,
    },
  },
  {
    timestamps: true,
  }
);

roomModel.index({ location: "2dsphere" }); // INDEX FOR GEOSPATIAL QUERIES
export const Room = model("Room", roomModel);

// GET ALL ROOMS
export const getRooms = () => Room.find();

export const getRoomById = (id) => Room.findOne({ _id: id });

export const deleteRoomById = (id) => Room.findByIdAndDelete(id);
export const updateRoomById = (id, values) =>
  Room.findByIdAndUpdate(id, values, { new: true });
