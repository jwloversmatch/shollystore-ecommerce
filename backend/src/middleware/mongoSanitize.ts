import { Request, Response, NextFunction } from 'express';

/** Strip MongoDB operator keys ($gt, $where, etc.) from user input to prevent NoSQL injection */
const sanitize = (obj: unknown): void => {
  if (!obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      sanitize(item);
    }
    return;
  }

  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete (obj as Record<string, unknown>)[key];
      continue;
    }
    sanitize((obj as Record<string, unknown>)[key]);
  }
};

export const mongoSanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  next();
};
