import { Request, Response } from 'express';
import { Settings } from '../models/Settings';

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

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bankAccountName, bankAccountNumber, bankName, whatsappNumber } = req.body;
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    settings.bankAccountName = bankAccountName || settings.bankAccountName;
    settings.bankAccountNumber = bankAccountNumber || settings.bankAccountNumber;
    settings.bankName = bankName || settings.bankName;
    settings.whatsappNumber = whatsappNumber || settings.whatsappNumber;
    await settings.save();
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};