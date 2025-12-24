const jwt = require('jsonwebtoken');

function getJwtSecret() {
  return process.env.JWT_SECRET || 'dev-secret-change-me';
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    const err = new Error('Missing Authorization header');
    err.statusCode = 401;
    return next(err);
  }

  const token = header.slice('bearer '.length).trim();
  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = payload;
    return next();
  } catch {
    const err = new Error('Invalid token');
    err.statusCode = 401;
    return next(err);
  }
}

module.exports = {
  auth,
  getJwtSecret,
};
