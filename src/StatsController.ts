import { Request, Response } from 'express';
import { handleAsyncErrors } from './ErrorHanlers';
import { MongoClient, Collection } from 'mongodb';

const connectionString = process.env.DB_CONNECTION_STRING as string;
const dbName = 'dwscore';
const X01CollectionName = 'X01';
const CricketCollectionName = 'cricket';
const twoWeeksInMs = 12096e5;
const limit = 10;

const afterDateStep = {
  endedAt: { $gt: new Date(Date.now() - twoWeeksInMs).toISOString() }
};

const limitStep = { $limit: 10 };

type StatCollection = {
  title: string;
  values: Stat[];
};

type Stat = {
  _id: string;
  value: number;
};

export class StatsController {
  static allStats = handleAsyncErrors(
    async (req: Request, res: Response): Promise<any> => {
      const client = await MongoClient.connect(connectionString);
      const db = client.db(dbName);
      const X01Collection = db.collection(X01CollectionName);
      const CricketCollection = db.collection(CricketCollectionName);

      res.json([
        await StatsController.getX01Wins(X01Collection),
        await StatsController.getX01Averages(X01Collection),
        await StatsController.getCricketTurnsPerWin(CricketCollection),
        await StatsController.getCricketWins(CricketCollection),
        await StatsController.getCricketLoses(CricketCollection),
        await StatsController.getX01Loses(X01Collection)
      ]);

      client.close();
    }
  );

  private static getX01Averages = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'X01 Average Hit',
      values: await collection
        .aggregate<Stat>([
          { $match: afterDateStep },
          { $unwind: '$history' },
          { $match: { 'history.result': { $eq: 0 } } },
          { $replaceRoot: { newRoot: '$history' } },
          { $unwind: '$throws' },
          {
            $group: {
              _id: '$username',
              value: { $avg: '$throws' }
            }
          },
          { $sort: { value: -1 } },
          limitStep
        ])
        .toArray()
    };
  };

  private static getX01Wins = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'X01 total wins',
      values: await collection
        .aggregate<Stat>([
          { $match: afterDateStep },
          {
            $group: { _id: '$winner', value: { $sum: 1 } }
          },
          { $sort: { value: -1 } },
          limitStep
        ])
        .toArray()
    };
  };

  private static getX01Loses = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'X01 total loses',
      values: await collection
        .aggregate<Stat>([
          { $match: afterDateStep },
          { $unwind: '$players' },
          {
            $addFields: {
              isWinner: { $eq: ['$players', '$winner'] }
            }
          },
          { $match: { isWinner: { $eq: false } } },
          { $group: { _id: '$players', value: { $sum: 1 } } },
          { $sort: { value: -1 } },
          limitStep
        ])
        .toArray()
    };
  };

  private static getCricketWins = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'Cricket total wins',
      values: await collection
        .aggregate<Stat>([
          {
            $match: {
              $and: [{ winner: { $ne: null } }, afterDateStep]
            }
          },
          {
            $group: { _id: '$winner', value: { $sum: 1 } }
          },
          { $sort: { value: -1 } },
          { $limit: 10 }
        ])
        .toArray()
    };
  };

  private static getCricketLoses = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'Cricket total loses',
      values: await collection
        .aggregate<Stat>([
          {
            $match: {
              $and: [{ winner: { $ne: null } }, afterDateStep]
            }
          },
          { $unwind: '$players' },
          {
            $addFields: {
              isWinner: { $eq: ['$players', '$winner'] }
            }
          },
          { $match: { isWinner: { $eq: false } } },
          { $group: { _id: '$players', value: { $sum: 1 } } },
          { $sort: { value: -1 } },
          limitStep
        ])
        .toArray()
    };
  };

  private static getCricketTurnsPerWin = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'Cricket turns per win',
      values: await collection
        .aggregate<Stat>([
          { $unwind: '$history' },
          {
            $addFields: {
              isWinner: { $eq: ['$history.username', '$winner'] }
            }
          },
          { $match: { isWinner: { $eq: true } } },
          {
            $group: {
              _id: '$winner',
              gameIds: { $addToSet: '$_id' },
              turns: { $sum: 1 }
            }
          },
          {
            $addFields: { gamesCount: { $size: '$gameIds' } }
          },
          {
            $project: {
              _id: 1,
              value: { $divide: ['$turns', '$gamesCount'] }
            }
          },
          { $sort: { value: 1 } },
          limitStep
        ])
        .toArray()
    };
  };
}
