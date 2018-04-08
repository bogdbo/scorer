import { Request, Response } from 'express';

export class AboutController {
  static about = async (req: Request, res: Response): Promise<void> => {
    res.json({
      version: process.env.HEROKU_RELEASE_VERSION,
      from: process.env.HEROKU_RELEASE_CREATED_AT
    });
  };
}
