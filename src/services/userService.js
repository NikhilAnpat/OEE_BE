const prisma = require('../prismaClient');

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

async function createUser(data) {
  const toCreate = { ...data };
  // Store password as provided (plaintext) per request.
  return prisma.user.create({ data: toCreate, select: safeUserSelect });
}

async function getAllUsers() {
  return prisma.user.findMany({ select: safeUserSelect });
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }, select: safeUserSelect });
}

async function updateUserById(id, data) {
  const patch = { ...data };
  // Store password as provided (plaintext) per request.
  return prisma.user.update({ where: { id }, data: patch, select: safeUserSelect });
}

async function deleteUserById(id) {
  return prisma.user.delete({ where: { id } });
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
