const prisma = require('../prismaClient');

async function createUser(data) {
  return prisma.user.create({ data });
}

async function getAllUsers() {
  return prisma.user.findMany();
}

async function getUserById(id) {
  return prisma.user.findUnique({ where: { id } });
}

async function updateUserById(id, data) {
  return prisma.user.update({ where: { id }, data });
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
