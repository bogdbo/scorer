import * as express from 'express';
import * as path from 'path';
import { UserController } from './src/UserController';
import { DartsController } from './src/DartsController';
import { NotificationController } from './src/NotificationsController';
import { json } from 'body-parser';
import { handleDatabaseErrors } from './src/ErrorHanlers';
import { StatsController } from './src/StatsController';
import { AboutController } from './src/AboutController';

var app = express();
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(json());

app.get('/api/v1/users', UserController.list);
app.post('/api/v1/darts/notify', NotificationController.notify);
app.post('/api/v1/darts/X01', DartsController.uploadX01);
app.post('/api/v1/darts/cricket', DartsController.uploadCricket);
app.get('/api/v1/stats', StatsController.allStats);
app.get('/api/v1/about', AboutController.about);

app.use(handleDatabaseErrors);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '../client/build/index.html'));
});

app.listen(process.env.PORT);
console.log(`API listeing on port: ${process.env.PORT}`);
