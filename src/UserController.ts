import { MongoClient, ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import * as mongoose from 'mongoose';
import { Schema } from 'mongoose';

const connectionString = process.env.DB_CONNECTION_STRING as string;

const User = mongoose.model(
  'user',
  new Schema({
    username: String
  })
);

export class UserController {
  static list = async (req: Request, res: Response): Promise<void> => {
    await mongoose.connect(connectionString);
    const users = await User.find()
      .sort([['username', '1']])
      .exec();
    await res.json(users);
    await mongoose.disconnect();
  };
}
