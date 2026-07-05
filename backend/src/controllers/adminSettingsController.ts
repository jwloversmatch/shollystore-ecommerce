import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { SettingsChangeLog } from '../models/SettingsChangeLog';
import { AuthRequest } from '../middleware/auth';

// @desc    Get public settings (unchanged)
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings (handles all fields including landingMode + logs changes)
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Keep a shallow copy of the old document for comparison
    const oldSettings = settings.toObject() as Record<string, any>;

    // All fields we want to track and update
    const fieldsToTrack = [
      'bankAccountName',
      'bankAccountNumber',
      'bankName',
      'whatsappNumber',
      'heroTagline',
      'heroTitle',
      'heroDescription',
      'specialOfferTitle',
      'specialOfferText',
      'landingMode',   // ✅ added
    ];

    const updatedFields: { field: string; oldValue: string; newValue: string }[] = [];

    for (const field of fieldsToTrack) {
      // Skip if the field is not present in the request body
      if (req.body[field] === undefined) continue;

      let newValue: any = req.body[field];

      // Normalize boolean for landingMode (frontend may send string "true"/"false" or "on")
      if (field === 'landingMode') {
        newValue = newValue === true || newValue === 'true' || newValue === 'on';
      }

      // Convert old value to string safely (fallback to empty string if never set)
      const oldValueStr = (oldSettings[field] != null) ? String(oldSettings[field]) : '';

      // Convert new value to string for logging
      const newValueStr = String(newValue);

      if (newValueStr !== oldValueStr) {
        updatedFields.push({
          field,
          oldValue: oldValueStr,
          newValue: newValueStr,
        });
        // Apply the update to the settings document
        (settings as any)[field] = newValue;
      }
    }

    const updatedSettings = await settings.save();

    // Log changes asynchronously (wait to ensure logs are saved)
    if (updatedFields.length > 0) {
      const adminEmail = req.user?.email || 'unknown';
      const logs = updatedFields.map((change) => ({
        adminEmail,
        field: change.field,
        oldValue: String(change.oldValue),
        newValue: String(change.newValue),
      }));
      await SettingsChangeLog.insertMany(logs);
    }

    res.json(updatedSettings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get last 20 settings changes
// @route   GET /api/admin/settings/changes
export const getSettingsChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await SettingsChangeLog.find()
      .sort({ changedAt: -1 })
      .limit(20)
      .lean();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};