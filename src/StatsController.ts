import { Request, Response } from 'express';
import { handleAsyncErrors } from './ErrorHanlers';
import { MongoClient, Collection } from 'mongodb';

const connectionString = process.env.DB_CONNECTION_STRING as string;
const dbName = 'dwscore';
const X01CollectionName = 'X01';
const CricketCollectionName = 'cricket';
const twoWeeksInMs = 12096e5;

type X01Average = {
  username: string;
  average: number;
};

type CricketWins = {
  username: string;
  wins: number;
};

export class StatsController {
  static allStats = handleAsyncErrors(
    async (req: Request, res: Response): Promise<any> => {
      const client = await MongoClient.connect(connectionString);
      const db = client.db(dbName);
      const X01Collection = db.collection(X01CollectionName);
      const CricketCollection = db.collection(CricketCollectionName);

      res.json({
        X01Averages: await StatsController.getX01Averages(X01Collection),
        CricketWins: await StatsController.getCricketWins(X01Collection)
      });

      client.close();
    }
  );

  private static getX01Averages = async (
    collection: Collection<any>
  ): Promise<X01Average[]> => {
    return await collection
      .aggregate<X01Average>([
        {
          $match: {
            endedAt: { $gt: new Date(Date.now() - twoWeeksInMs).toISOString() }
          }
        },
        { $unwind: '$history' },
        { $match: { 'history.result': { $eq: 0 } } },
        { $replaceRoot: { newRoot: '$history' } },
        { $unwind: '$throws' },
        {
          $group: {
            _id: '$username',
            average: { $avg: '$throws' },
            throws: { $push: '$throws' }
          }
        },
        { $sort: { average: -1 } },
        { $limit: 10 }
      ])
      .toArray();
  };

  private static getCricketWins = async (
    collection: Collection<any>
  ): Promise<CricketWins[]> => {
    return await collection
      .aggregate<CricketWins>([
        {
          $match: {
            $and: [
              { winner: { $ne: null } },
              {
                endedAt: {
                  $gt: new Date(Date.now() - twoWeeksInMs).toISOString()
                }
              }
            ]
          }
        },
        {
          $group: { _id: '$winner', wins: { $sum: 1 } }
        },
        { $sort: { wins: -1 } },
        { $limit: 10 }
      ])
      .toArray();
  };
}
