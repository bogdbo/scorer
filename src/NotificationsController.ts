import { Request, Response } from 'express';
import axios, { AxiosPromise, AxiosResponse } from 'axios';

export class NotificationController {
  static notify = async (
    req: Request,
    res: Response,
    next: any
  ): Promise<void> => {
    if (!process.env.SLACK_WEBHOOK) {
      res.sendStatus(501);
    } else if (!req.body.text) {
      res.sendStatus(400);
    } else {
      try {
        // force configured channel and if not configured (empty)
        // it will post to default webhook channel
        req.body.channel = process.env.DARTS_CHANNEL;
        const response: AxiosResponse<any> = await axios.post<any>(
          process.env.SLACK_WEBHOOK,
          req.body
        );
        res.status(response.status).send(response.statusText);
      } catch (ex) {
        res.status(503).send(ex);
      }
    }
  };
}
