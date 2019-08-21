'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const { sequelize } = require('./models');

// constant to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// API routes setup
app.use("/api/users", require("./routes/users"));
app.use("/api/courses", require("./routes/courses"));

//default/'Home Page' route handler
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to my REST API project!'});
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({ message: 'Route Not Found'});
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

//authenticate the connection to the database, synchronize and open connection. If it fails, log an error message.
sequelize
  .authenticate()
  .then(() => {
    return sequelize.sync();
  })
  .then(() => {
    const serverPort = app.listen(app.get('port'), () => {
      console.log(`We are good to go! Express server is live and listening on port ${serverPort.address().port}`);
    });
  })
  .catch(err => console.log('Connection failed! Unable to connect to the database'));
