import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: 'Invalid request body',
        details: parsed.error.flatten(),
      });
    }
    // Store validated body in res.locals
    (res.locals as any).body = parsed.data;
    return next();
  };
}
