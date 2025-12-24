const authService = require('../services/authService');

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user?.userId;
    const result = await authService.me({ userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  me,
};
