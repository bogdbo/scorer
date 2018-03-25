Some notes:

Dev

1.  create `.env` file with contents like these

```
 NODE_ENV=local
 DB_CONNECTION_STRING=mongodb://localhost  
 PORT=5000
 SLACK_WEBHOOK=https://hooks.slack.com/services/....
 DARTS_CHANNEL=darts
```

2.  run `heroku local dev`
3.  `cd client`
4.  `npm start`

Prod

1.  Heroku - configure env variables
2.  Deploy (eg. from heroku dashboard, github integration)
3.  Done (heroku will automatically call `npm start` and `npm run heroku-postbuild` which will build the API and Client and start listening on PORT)
