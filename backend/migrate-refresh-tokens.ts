import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User';

dotenv.config();

const migrateRefreshTokens = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');

    // Find users with old format refresh tokens (strings instead of objects)
    const users = await User.find({
      refreshTokens: { $not: { $size: 0 } }
    });

    let migratedCount = 0;

    for (const user of users) {
      let needsUpdate = false;

      // Convert old string tokens to new object format
      const updatedTokens = user.refreshTokens.map((token: any) => {
        // Check if it's an old string token
        if (typeof token === 'string') {
          needsUpdate = true;
          return {
            token: token,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          };
        }
        // If it's already an object, keep it as is
        return token;
      });

      if (needsUpdate) {
        user.refreshTokens = updatedTokens;
        await user.save();
        migratedCount++;
        console.log(`Migrated user: ${user.email}`);
      }
    }

    console.log(`\nMigration complete!`);
    console.log(`Users migrated: ${migratedCount}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateRefreshTokens();