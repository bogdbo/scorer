import * as express from 'express';
import * as path from 'path';
import { MongoClient } from 'mongodb';

const connectionString = process.env.DB_CONNECTION_STRING || '';
const port = process.env.PORT || 5000;

var app = express();
app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/api/v1/users', async (req, res) => {
  var client = await MongoClient.connect(connectionString);
  const collection = client.db('dwscore').collection('users');
  var users = await collection.find({}, { sort: 'username' }).toArray();
  res.json(users);
  await client.close();
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port);
console.log(`API listeing on port: ${port}`);
