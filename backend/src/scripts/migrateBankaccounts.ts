// One-time migration — run this ONCE after deploying the updated Settings
// model, before (or right after) removing the old flat bank fields from
// production data. Safe to run multiple times: it no-ops if bankAccounts
// already has entries or no legacy fields are found.
//
// Usage: npx ts-node scripts/migrateBankAccounts.ts

import mongoose from "mongoose";
import { Settings } from "../models/Settings";

async function migrate() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);

  // Ensure the database connection is fully established
  if (!mongoose.connection.db) {
    console.error("Database connection not established");
    await mongoose.disconnect();
    process.exit(1);
  }

  const settings = await Settings.findOne();
  if (!settings) {
    console.log("No settings document found — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  if (settings.bankAccounts && settings.bankAccounts.length > 0) {
    console.log("bankAccounts already populated — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  // Read the legacy flat fields directly from the raw document, since
  // they're no longer declared on the schema and won't appear on `settings`
  // itself once the new model is in place.
  const raw = await mongoose.connection.db
    .collection("settings")
    .findOne({ _id: settings._id });

  const legacyAccountNumber = raw?.bankAccountNumber;
  const legacyAccountName = raw?.bankAccountName;
  const legacyBankName = raw?.bankName;

  if (!legacyAccountNumber && !legacyAccountName && !legacyBankName) {
    console.log("No legacy bank fields found — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  await Settings.updateOne(
    { _id: settings._id },
    {
      $set: {
        bankAccounts: [
          {
            _id: new mongoose.Types.ObjectId(),
            label: "Primary",
            bankName: legacyBankName || "",
            accountName: legacyAccountName || "",
            accountNumber: legacyAccountNumber || "",
            isDefault: true,
            isActive: true,
          },
        ],
      },
      $unset: {
        bankAccountName: "",
        bankAccountNumber: "",
        bankName: "",
      },
    },
  );

  console.log(
    `Migrated legacy account (${legacyBankName || "unknown bank"}) into bankAccounts[0] and set it as default.`,
  );

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});