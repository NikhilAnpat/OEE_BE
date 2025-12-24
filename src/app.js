const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const alertRuleRoutes = require('./routes/alertRuleRoutes');
const alertRoutes = require('./routes/alertRoutes');
const eventRecordRoutes = require('./routes/eventRecordRoutes');
const energyReadingRoutes = require('./routes/energyReadingRoutes');
const errorHandler = require('./middlewares/errorHandler');

function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
  app.use(express.json());

  app.get('/', (req, res) => {
    res.json({ message: 'OEE_BE running' });
  });

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/permissions', permissionRoutes);
  app.use('/alert-rules', alertRuleRoutes);
  app.use('/alerts', alertRoutes);
  app.use('/event-records', eventRecordRoutes);
  app.use('/energy-readings', energyReadingRoutes);

  // last
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
