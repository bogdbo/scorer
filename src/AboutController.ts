import { Request, Response } from 'express';
import { withCache } from './handlers/CacheHandler';

const cacheDuration = 86400;

export class AboutController {
  static about = withCache(
    cacheDuration,
    async (req: Request, res: Response): Promise<void> => {
      res.json({
        version: process.env.HEROKU_RELEASE_VERSION,
        from: process.env.HEROKU_RELEASE_CREATED_AT
      });
    }
  );
}
