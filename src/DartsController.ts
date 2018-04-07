import { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import { handleAsyncErrors } from './ErrorHanlers';

const connectionString = process.env.DB_CONNECTION_STRING as string;
const dbName = 'dwscore';

export class DartsController {
  static uploadX01 = handleAsyncErrors(
    async (req: Request, res: Response, next: any): Promise<any> => {
      const result = await DartsController.uploadGame('X01', req.body);
      res.send(result);
      next();
    }
  );

  static uploadCricket = handleAsyncErrors(
    async (req: Request, res: Response, next: any): Promise<any> => {
      const result = await DartsController.uploadGame('cricket', req.body);
      res.send(result);
      next();
    }
  );

  private static uploadGame = async (collectionName: string, data: any) => {
    const client = await MongoClient.connect(connectionString);
    const db = client.db('dwscore');
    const collection = db.collection(collectionName);
    var result = await collection.insertOne(data);
    client.close();
    return result;
  };
}
