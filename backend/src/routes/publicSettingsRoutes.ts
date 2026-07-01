import express from 'express';
import { Settings } from '../models/Settings';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({
      bankAccountName: settings.bankAccountName,
      bankAccountNumber: settings.bankAccountNumber,
      bankName: settings.bankName,
      whatsappNumber: settings.whatsappNumber,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;