Some notes:

Dev

1.  create `.env` file with contents like these

```NODE_ENV=local
 DB_CONNECTION_STRING=mongodb://localhost  
 PORT=5000
```

2.  run `heroku local dev`
3.  `cd client`
4.  `npm start`

Prod

1.  Heroku - configure env variables
2.  Deploy (eg. from heroku dashboard, github integration)
3.  Done
