const express = require('express');

const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({ message: 'OEE_BE running' });
  });

  app.use('/users', userRoutes);

  // last
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
