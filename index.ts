import * as express from 'express';
import * as path from 'path';
import { MongoClient } from 'mongodb';
import { UserController } from './src/UserController';
import { DartsController } from './src/DartsController';

var app = express();
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/api/v1/users', UserController.list);
app.put('/api/v1/darts', DartsController.newGame);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../client/build/index.html'));
});

app.listen(process.env.PORT);
console.log(`API listeing on port: ${process.env.PORT}`);
