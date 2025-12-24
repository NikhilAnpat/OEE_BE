const eventRecordService = require('../services/eventRecordService');

function parseId(req) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    const err = new Error('Invalid id');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

async function create(req, res, next) {
  try {
    const row = await eventRecordService.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { meterId, start, end, page, limit } = req.query;
    const result = await eventRecordService.list({ meterId, start, end, page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req);
    const row = await eventRecordService.getById(id);
    if (!row) return res.status(404).json({ error: 'EventRecord not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function updateById(req, res, next) {
  try {
    const id = parseId(req);
    const row = await eventRecordService.updateById(id, req.body);
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function deleteById(req, res, next) {
  try {
    const id = parseId(req);
    await eventRecordService.deleteById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  updateById,
  deleteById,
};
