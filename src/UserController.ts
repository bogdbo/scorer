import { Request, Response } from 'express';
import { handleAsyncErrors } from './handlers/ErrorHandlers';

const connectionString = process.env.DB_CONNECTION_STRING as string;

export class UserController {
  static list = handleAsyncErrors(async (req: Request, res: Response): Promise<
    void
  > => {});
}
