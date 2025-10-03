import { NextFunction, Request, Response } from 'express';

// Basic error handler; expand in future with codes and logging
export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  req.log?.error({ err }, 'Unhandled error');
  const status = err?.statusCode ?? 500;
  const payload: Record<string, unknown> = { message: err?.message || 'Internal server error' };
  if (err?.code) payload.code = err.code;
  return res.status(status).json(payload);
}
