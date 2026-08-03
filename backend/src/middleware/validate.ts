import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export const validate =
  (schema: ZodSchema, source: RequestSource = 'body') =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((i) => i.message).join('; ');
        res.status(400).json({ success: false, message });
        return;
      }
      next(error);
    }
  };
