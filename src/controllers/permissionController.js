const permissionService = require('../services/permissionService');

function parseUserId(req) {
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId)) {
    const err = new Error('Invalid userId');
    err.statusCode = 400;
    throw err;
  }
  return userId;
}

async function getAll(req, res, next) {
  try {
    const rows = await permissionService.getAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getByUserId(req, res, next) {
  try {
    const userId = parseUserId(req);
    const row = await permissionService.getByUserId(userId);
    if (!row) return res.status(404).json({ error: 'Permissions not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function updateByUserId(req, res, next) {
  try {
    const userId = parseUserId(req);
    const row = await permissionService.updateByUserId(userId, req.body);
    res.json(row);
  } catch (err) {
    next(err);
  }
}

async function resetToDefaults(req, res, next) {
  try {
    const userId = parseUserId(req);
    const { role } = req.body || {};
    if (!role) {
      const err = new Error('role is required');
      err.statusCode = 400;
      throw err;
    }
    const row = await permissionService.upsertDefaultPermissionsForUser(userId, role);
    res.json(row);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getByUserId,
  updateByUserId,
  resetToDefaults,
};
