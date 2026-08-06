let mongoose;
let listenersRegistered = false;

const loadMongoose = async () => {
  if (!mongoose) {
    mongoose = (await import("mongoose")).default;
  }

  if (!listenersRegistered) {
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        process.exit(0);
      } catch (error) {
        console.error("Error closing MongoDB connection:", error.message);
        process.exit(1);
      }
    });

    listenersRegistered = true;
  }

  return mongoose;
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "MongoDB connection failed: MONGO_URI is missing in backend/.env",
    );
    process.exit(1);
  }

  const mongooseClient = await loadMongoose();

  if (mongooseClient.connection.readyState === 1) {
    console.log("MongoDB already connected");
    return;
  }

  if (mongooseClient.connection.readyState === 2) {
    console.log("MongoDB connection already in progress");
    return;
  }

  try {
    await mongooseClient.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
