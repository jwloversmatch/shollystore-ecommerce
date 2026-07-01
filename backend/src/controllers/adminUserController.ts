import { Request, Response } from 'express';
import { User } from '../models/User';

// @desc    Get all users (except admins, or include them)
// @route   GET /api/admin/users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role (promote to admin, demote to user)
// @route   PUT /api/admin/users/:id/role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    user.role = role;
    await user.save();
    res.json({ success: true, message: 'User role updated' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};