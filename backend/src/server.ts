import app from './app';
import connectDB from './config/db';
import { validateEnv } from './config/env';
import mongoose from 'mongoose';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    validateEnv();
    await connectDB();
    const server = app.listen(PORT, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ Server running on port ${PORT}`);
      }
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        console.log('✅ Server closed. Exiting process.');
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        console.error('⚠️ Forcing shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();