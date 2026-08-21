import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Product } from "../models/Product";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const migrateLowStockFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ Connected to MongoDB");

    const result = await Product.updateMany(
      {
        $or: [
          { lowStockThreshold: { $exists: false } },
          { lowStockNotified: { $exists: false } },
        ],
      },
      {
        $set: {
          lowStockThreshold: 5,
          lowStockNotified: false,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} products`);
    console.log(`Matched ${result.matchedCount} products`);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateLowStockFields();