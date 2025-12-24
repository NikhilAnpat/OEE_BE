const energyReadingService = require('../services/energyReadingService');

async function create(req, res, next) {
  try {
    const row = await energyReadingService.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { deviceId, start, end, limit } = req.query;
    const rows = await energyReadingService.list({ deviceId, start, end, limit });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function kpi(req, res, next) {
  try {
    const { deviceId, start, end, costPerKwh } = req.query;
    const result = await energyReadingService.kpi({ deviceId, start, end, costPerKwh });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  kpi,
};
