import mongoose from "mongoose";

// const mongodbURL = process.env.MONGODB_URL || ('' as string);

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      "mongodb+srv://tmathu2:6Z1JZ5ZvBpToZcbO@cluster0.qo2lq.mongodb.net/umoozi-dev?retryWrites=true&w=majority"
    );
    console.log("🚀 ~ connectDB ~ connection:", connection);
  } catch (error) {
    console.log("🚀 ~ connectDB ~ error:", error);

    // process.exit(1);
  }
};
