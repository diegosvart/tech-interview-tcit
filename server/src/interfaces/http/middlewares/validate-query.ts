import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Validates req.query against a Zod schema and stores the typed result in res.locals.query
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query as unknown);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid query parameters',
        details: parsed.error.flatten(),
      });
    }
    (res.locals as any).query = parsed.data;
    return next();
  };
}
