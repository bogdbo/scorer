import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

export const withCache = (duration: number, fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', `public, max-age=${duration}`);
    await fn(req, res, next);
    next();
  };
};
