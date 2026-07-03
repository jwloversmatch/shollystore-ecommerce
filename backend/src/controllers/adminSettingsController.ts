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

// @desc    Update settings (now handles all fields + logs changes)
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Keep a shallow copy of the old document for comparison
    const oldSettings = settings.toObject() as Record<string, any>;

    // List of all fields we want to track
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
    ];

    const updatedFields: { field: string; oldValue: string; newValue: string }[] = [];

    for (const field of fieldsToTrack) {
      if (req.body[field] !== undefined && req.body[field] !== (oldSettings[field] || '')) {
        updatedFields.push({
          field,
          oldValue: oldSettings[field] || '',
          newValue: req.body[field],
        });
        (settings as any)[field] = req.body[field];
      }
    }

    const updatedSettings = await settings.save();

    // Log changes asynchronously (we don't await to keep the request fast)
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