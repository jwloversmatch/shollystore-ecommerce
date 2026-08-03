import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AuthRequest } from './auth';

/** Optional auth — attaches user if valid token present, continues otherwise */
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  if (!req.headers.authorization?.startsWith('Bearer')) {
    next();
    return;
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user as IUser;
  } catch {
    // Invalid token — continue without user
  }
  next();
};
