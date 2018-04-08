import { Request, Response } from 'express';
import { MongoClient, Collection } from 'mongodb';
import { handleAsyncErrors } from './handlers/ErrorHandlers';
import { withCache } from './handlers/CacheHandler';
import * as _ from 'lodash';

const connectionString = process.env.DB_CONNECTION_STRING as string;
const dbName = 'dwscore';
const X01CollectionName = 'X01';
const CricketCollectionName = 'cricket';
const twoWeeksInMs = 12096e5;

const afterDateStep = {
  endedAt: { $gt: new Date(Date.now() - twoWeeksInMs).toISOString() }
};

const limitStep = { $limit: 10 };

export type StatCollection = {
  title: string;
  values: Stat[];
};

export type Stat = {
  _id: string;
  value: number;
};

export class StatsController {
  static allMedals = handleAsyncErrors(
    withCache(300, async (req: Request, res: Response): Promise<void> => {
      const client = await MongoClient.connect(connectionString);
      const db = client.db(dbName);
      const X01Collection = db.collection(X01CollectionName);
      const CricketCollection = db.collection(CricketCollectionName);
      const goodStats = [
        await StatsController.getX01Wins(X01Collection),
        await StatsController.getX01Averages(X01Collection),
        await StatsController.getCricketWins(CricketCollection),
        await StatsController.getCricketTurnsPerWin(CricketCollection)
      ];

      const result =
        goodStats &&
        goodStats.reduce((acc: any, cur: StatCollection) => {
          _.take(cur.values, 3).forEach((e: Stat, i: number) => {
            if (!acc[e._id]) {
              acc[e._id] = {};
            }

            acc[e._id][i] = (acc[e._id][i] || 0) + 1;
          });

          return acc;
          // tslint:disable-next-line:align
        }, {});

      res.json(result);
    })
  );

  static allStats = handleAsyncErrors(
    withCache(300, async (req: Request, res: Response): Promise<void> => {
      const client = await MongoClient.connect(connectionString);
      const db = client.db(dbName);
      const X01Collection = db.collection(X01CollectionName);
      const CricketCollection = db.collection(CricketCollectionName);

      res.json([
        await StatsController.getX01Wins(X01Collection),
        await StatsController.getX01Averages(X01Collection),
        await StatsController.getX01Loses(X01Collection),
        await StatsController.getCricketWins(CricketCollection),
        await StatsController.getCricketTurnsPerWin(CricketCollection),
        await StatsController.getCricketLoses(CricketCollection)
      ]);

      client.close();
    })
  );

  static AllX01Averages = withCache(
    300,
    async (req: Request, res: Response) => {
      const client = await MongoClient.connect(connectionString);
      const db = client.db(dbName);
      const X01Collection = db.collection(X01CollectionName);
      res.json(await StatsController.getX01Averages(X01Collection));
    }
  );

  static AllCricketTurnsPerWin = withCache(
    300,
    async (req: Request, res: Response) => {
      const client = await MongoClient.connect(connectionString);
      const db = client.db(dbName);
      const CricketCollection = db.collection(CricketCollectionName);
      res.json(await StatsController.getCricketTurnsPerWin(CricketCollection));
    }
  );

  private static getX01Averages = async (
    collection: Collection<Stat>
  ): Promise<StatCollection> => {
    return {
      title: 'X01 average throw',
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
