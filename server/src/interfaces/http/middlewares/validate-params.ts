import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Validates req.params against a Zod schema and stores the typed result in res.locals.params
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params as unknown);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid path parameters',
        details: parsed.error.flatten(),
      });
    }
    (res.locals as any).params = parsed.data;
    return next();
  };
}
