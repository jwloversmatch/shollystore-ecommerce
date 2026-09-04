import app from "./app";
import connectDB from "./config/db";
import { validateEnv } from "./config/env";
import mongoose from "mongoose";

const PORT = process.env.PORT || 5000;

let shuttingDown = false;

const gracefulShutdown = async (
  server: import("http").Server,
  signal: string,
) => {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      console.error("Error during server close:", err);
      process.exit(1);
    }

    try {
      await mongoose.connection.close();
      console.log("✅ Database connection closed.");
    } catch (dbError) {
      console.error("Error closing database connection:", dbError);
    } finally {
      console.log("✅ Server closed. Exiting process.");
      process.exit(0);
    }
  });

  // Force exit after 10 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error("⚠️ Forcing shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

const startServer = async (): Promise<void> => {
  try {
    validateEnv();
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });

    // Handle server errors (e.g., port already in use)
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use.`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });

    // Process-level handlers
    process.on("SIGINT", () => gracefulShutdown(server, "SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown(server, "SIGTERM"));

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      gracefulShutdown(server, "uncaughtException");
    });

    process.on("unhandledRejection", (reason) => {
      console.error("❌ Unhandled Rejection:", reason);
      gracefulShutdown(server, "unhandledRejection");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
