const alertService = require('../services/alertService');

function parseId(req) {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    const err = new Error('Invalid id');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

async function list(req, res, next) {
  try {
    const { page, limit, start, end } = req.query;
    const result = await alertService.list({ page, limit, start, end });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const row = await alertService.create(req.body);
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

async function deleteById(req, res, next) {
  try {
    const id = parseId(req);
    await alertService.deleteById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  create,
  deleteById,
};
