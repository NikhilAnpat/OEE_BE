const alertRuleService = require('../services/alertRuleService');

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
    const createdById = req.user?.userId;
    const rule = await alertRuleService.create(req.body, createdById);
    res.status(201).json(rule);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const rules = await alertRuleService.list();
    res.json(rules);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const id = parseId(req);
    const rule = await alertRuleService.getById(id);
    if (!rule) return res.status(404).json({ error: 'AlertRule not found' });
    res.json(rule);
  } catch (err) {
    next(err);
  }
}

async function updateById(req, res, next) {
  try {
    const id = parseId(req);
    const rule = await alertRuleService.updateById(id, req.body);
    res.json(rule);
  } catch (err) {
    next(err);
  }
}

async function deleteById(req, res, next) {
  try {
    const id = parseId(req);
    await alertRuleService.deleteById(id);
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
