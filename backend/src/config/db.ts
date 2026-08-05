import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const connectDB = async (retriesLeft = MAX_RETRIES): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });
  } catch (error) {
    if (retriesLeft > 0) {
      console.error(
        `MongoDB connection failed: ${(error as Error).message}. Retrying in ${RETRY_DELAY_MS / 1000}s (${retriesLeft} attempts left)...`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retriesLeft - 1);
    }
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB;
