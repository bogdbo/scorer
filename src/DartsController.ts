import { MongoClient } from 'mongodb';
import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { ObjectId } from 'bson';

const connectionString = process.env.DB_CONNECTION_STRING as string;

const Darts = mongoose.model(
  'Darts',
  new Schema({
    createdAt: {
      type: Date,
      default: Date.now
    },
    players: [],
    history: []
  })
);

export class DartsController {
  static newGame = async (req: Request, res: Response): Promise<void> => {
    await mongoose.connect(connectionString);
    var result = await Darts.create({});
    await res.json(result);
  };
}
