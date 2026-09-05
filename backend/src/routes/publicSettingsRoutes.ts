import express from 'express';
import { Settings } from '../models/Settings';

const router = express.Router();

// @desc    Get public settings (used by checkout, homepage, etc.)
// @route   GET /api/settings/public
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({
      bankAccounts: settings.bankAccounts || [],
      whatsappNumber: settings.whatsappNumber,
      heroTagline: settings.heroTagline,
      heroTitle: settings.heroTitle,
      heroDescription: settings.heroDescription,
      specialOfferTitle: settings.specialOfferTitle,
      specialOfferText: settings.specialOfferText,
      landingMode: settings.landingMode,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;