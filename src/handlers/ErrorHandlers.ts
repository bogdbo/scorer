import { ErrorRequestHandler } from 'express-serve-static-core';
import { MongoError } from 'mongodb';

export const handleAsyncErrors = (fn: any) => {
  return (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
};

export const handleDatabaseErrors: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  if (error instanceof MongoError) {
    res.status(503).json({ name: error.name });
  }

  next(error);
};
