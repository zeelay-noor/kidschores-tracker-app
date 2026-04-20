const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const fallbackUri = "mongodb://localhost:27017/kidsChoresDB";

  let mongoServer;

  const connect = async (uri) => {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  };

  try {
    if (!primaryUri) {
      console.log("No MONGODB_URI found, using local MongoDB...");
      await connect(fallbackUri);
      console.log("Connected to local MongoDB");
      return;
    }

    console.log("Attempting to connect to MongoDB Atlas...");
    await connect(primaryUri);
    console.log("MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("Primary MongoDB connection failed:", error.message);

    if (primaryUri) {
      console.log("Attempting fallback to local MongoDB...");
      try {
        await connect(fallbackUri);
        console.log("Connected to fallback local MongoDB");
      } catch (fallbackError) {
        console.error("Fallback local MongoDB connection failed:", fallbackError.message);
        console.log("Starting in-memory MongoDB server...");

        try {
          mongoServer = await MongoMemoryServer.create();
          const mongoUri = mongoServer.getUri();
          await connect(mongoUri);
          console.log("Connected to in-memory MongoDB server");
        } catch (memoryError) {
          console.error("In-memory MongoDB server failed:", memoryError.message);
          console.log("Please check your internet connection or install MongoDB locally");
          process.exit(1);
        }
      }
    } else {
      console.log("Starting in-memory MongoDB server...");
      try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await connect(mongoUri);
        console.log("Connected to in-memory MongoDB server");
      } catch (memoryError) {
        console.error("In-memory MongoDB server failed:", memoryError.message);
        console.log("Please set MONGODB_URI in your .env file or install MongoDB locally");
        process.exit(1);
      }
    }
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    if (mongoServer) {
      await mongoServer.stop();
    }
    process.exit(0);
  });
};

module.exports = connectDB;
