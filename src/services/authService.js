const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');
const { getJwtSecret } = require('../middlewares/auth');

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function unauthorized(message) {
  const err = new Error(message);
  err.statusCode = 401;
  return err;
}

const safeUserSelect = {
  id: true,
  email: true,
  user_name: true,
  role: true,
  full_name: true,
  company_name: true,
  mobile_no: true,
  country_code: true,
  photo: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

async function verifyPassword({ providedPassword, storedPassword }) {
  if (typeof storedPassword !== 'string') return false;
  if (typeof providedPassword !== 'string') return false;

  // Support both bcrypt hashes and legacy plaintext passwords.
  if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
    return bcrypt.compare(providedPassword, storedPassword);
  }
  return providedPassword === storedPassword;
}

async function login({ email, password }) {
  if (!email || !password) throw badRequest('email and password are required');

  const user = await prisma.user.findUnique({ where: { email }, select: { ...safeUserSelect, password: true } });
  if (!user) throw unauthorized('Invalid email or password');
  if (user.status === 'INACTIVE') throw unauthorized('User is inactive');

  const ok = await verifyPassword({ providedPassword: password, storedPassword: user.password });
  if (!ok) throw unauthorized('Invalid email or password');

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  const permissions = await prisma.userPermission.findUnique({ where: { userId: user.id } });

  // Strip password before returning.
  // eslint-disable-next-line no-unused-vars
  const { password: _pw, ...safeUser } = user;

  return {
    token,
    user: safeUser,
    permissions,
  };
}

async function me({ userId }) {
  if (!userId) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: safeUserSelect });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const permissions = await prisma.userPermission.findUnique({ where: { userId } });
  return { user, permissions };
}

module.exports = {
  login,
  me,
};
