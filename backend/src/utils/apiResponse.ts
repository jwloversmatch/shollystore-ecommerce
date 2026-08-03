import { Response } from 'express';

/** Consistent API error shape — never expose internal details to clients */
export const sendError = (
  res: Response,
  status: number,
  message: string,
  code?: string,
): void => {
  res.status(status).json({
    success: false,
    message,
    ...(code && { code }),
  });
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  status = 200,
): void => {
  res.status(status).json({ success: true, ...data });
};

/** Strip stack traces and internal messages from caught errors */
export const getSafeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && process.env.NODE_ENV !== 'production') {
    return error.message;
  }
  return 'Internal server error';
};
