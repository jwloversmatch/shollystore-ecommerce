import { Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { SettingsChangeLog } from '../models/SettingsChangeLog';
import { AuthRequest } from '../middleware/auth';

// Masks all but the last 4 digits — used only for audit log entries, since
// those may be visible to more admins than actually need the full number.
// The admin settings screen itself still shows full numbers for editing.
const maskAccountNumber = (num: string): string =>
  num.length > 4 ? `${'*'.repeat(num.length - 4)}${num.slice(-4)}` : num;

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

// @desc    Update flat settings fields (homepage content, WhatsApp, landing mode)
//          Bank accounts are managed separately below — see addBankAccount /
//          updateBankAccount / deleteBankAccount / setDefaultBankAccount.
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const oldSettings = settings.toObject() as Record<string, any>;

    const fieldsToTrack = [
      'whatsappNumber',
      'heroTagline',
      'heroTitle',
      'heroDescription',
      'specialOfferTitle',
      'specialOfferText',
      'landingMode',
    ];

    const updatedFields: { field: string; oldValue: string; newValue: string }[] = [];

    for (const field of fieldsToTrack) {
      if (req.body[field] === undefined) continue;

      let newValue: any = req.body[field];

      if (field === 'landingMode') {
        newValue = newValue === true || newValue === 'true' || newValue === 'on';
      }

      const oldValueStr = (oldSettings[field] != null) ? String(oldSettings[field]) : '';
      const newValueStr = String(newValue);

      if (newValueStr !== oldValueStr) {
        updatedFields.push({ field, oldValue: oldValueStr, newValue: newValueStr });
        (settings as any)[field] = newValue;
      }
    }

    const updatedSettings = await settings.save();

    if (updatedFields.length > 0) {
      const adminEmail = req.user?.email || 'unknown';
      const logs = updatedFields.map((change) => ({
        adminEmail,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      }));
      await SettingsChangeLog.insertMany(logs);
    }

    res.json(updatedSettings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Bank accounts (bank_transfer payment method) ───────────────────────────

// @desc    Add a bank account
// @route   POST /api/admin/settings/bank-accounts
export const addBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { label, bankName, accountName, accountNumber } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      res.status(400).json({ message: 'Bank name, account name, and account number are required' });
      return;
    }

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    const isFirstAccount = settings.bankAccounts.length === 0;

    settings.bankAccounts.push({
      label: label || '',
      bankName,
      accountName,
      accountNumber,
      isDefault: isFirstAccount, // first account added becomes default automatically
      isActive: true,
    } as any);

    await settings.save();

    await SettingsChangeLog.create({
      adminEmail: req.user?.email || 'unknown',
      field: 'bankAccounts',
      oldValue: '',
      newValue: `Added ${bankName} ${maskAccountNumber(accountNumber)}`,
    });

    res.status(201).json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a bank account
// @route   PUT /api/admin/settings/bank-accounts/:accountId
export const updateBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fix: cast req.params.accountId to string
    const accountId = String(req.params.accountId);
    const settings = await Settings.findOne();
    if (!settings) {
      res.status(404).json({ message: 'Settings not found' });
      return;
    }

    const account = settings.bankAccounts.id(accountId);
    if (!account) {
      res.status(404).json({ message: 'Bank account not found' });
      return;
    }

    const oldSummary = `${account.bankName} ${maskAccountNumber(account.accountNumber)}`;

    const { label, bankName, accountName, accountNumber, isActive } = req.body;
    if (label !== undefined) account.label = label;
    if (bankName !== undefined) account.bankName = bankName;
    if (accountName !== undefined) account.accountName = accountName;
    if (accountNumber !== undefined) account.accountNumber = accountNumber;
    if (isActive !== undefined) account.isActive = isActive;

    await settings.save();

    const newSummary = `${account.bankName} ${maskAccountNumber(account.accountNumber)}`;

    await SettingsChangeLog.create({
      adminEmail: req.user?.email || 'unknown',
      field: 'bankAccounts',
      oldValue: oldSummary,
      newValue: newSummary,
    });

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a bank account
// @route   DELETE /api/admin/settings/bank-accounts/:accountId
export const deleteBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fix: cast req.params.accountId to string
    const accountId = String(req.params.accountId);
    const settings = await Settings.findOne();
    if (!settings) {
      res.status(404).json({ message: 'Settings not found' });
      return;
    }

    const account = settings.bankAccounts.id(accountId);
    if (!account) {
      res.status(404).json({ message: 'Bank account not found' });
      return;
    }

    const wasDefault = account.isDefault;
    const summary = `${account.bankName} ${maskAccountNumber(account.accountNumber)}`;

    settings.bankAccounts.pull({ _id: accountId });

    // If the deleted account was the default and others remain, promote the
    // next active one — so bank_transfer checkout always has a default to
    // fall back on rather than silently going blank.
    if (wasDefault && settings.bankAccounts.length > 0) {
      const next = settings.bankAccounts.find((a) => a.isActive) || settings.bankAccounts[0];
      next.isDefault = true;
    }

    await settings.save();

    await SettingsChangeLog.create({
      adminEmail: req.user?.email || 'unknown',
      field: 'bankAccounts',
      oldValue: summary,
      newValue: '(removed)',
    });

    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set a bank account as the default shown to customers at checkout
// @route   PUT /api/admin/settings/bank-accounts/:accountId/default
export const setDefaultBankAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Fix: cast req.params.accountId to string
    const accountId = String(req.params.accountId);
    const settings = await Settings.findOne();
    if (!settings) {
      res.status(404).json({ message: 'Settings not found' });
      return;
    }

    const target = settings.bankAccounts.id(accountId);
    if (!target) {
      res.status(404).json({ message: 'Bank account not found' });
      return;
    }
    if (!target.isActive) {
      res.status(400).json({ message: 'Cannot set an inactive account as default' });
      return;
    }

    settings.bankAccounts.forEach((a) => {
      a.isDefault = a._id.equals(target._id);
    });
    await settings.save();

    await SettingsChangeLog.create({
      adminEmail: req.user?.email || 'unknown',
      field: 'bankAccounts',
      oldValue: '(previous default)',
      newValue: `${target.bankName} ${maskAccountNumber(target.accountNumber)} set as default`,
    });

    res.json(settings);
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