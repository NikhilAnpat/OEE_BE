const prisma = require('../prismaClient');

async function create(data, createdById) {
  const { meterLabel, parameter, threshold, message, isActive } = data || {};
  if (!meterLabel || !parameter || threshold === undefined || threshold === null || message === undefined) {
    const err = new Error('meterLabel, parameter, threshold, message are required');
    err.statusCode = 400;
    throw err;
  }

  return prisma.alertRule.create({
    data: {
      meterLabel,
      parameter,
      threshold: Number(threshold),
      message: String(message),
      isActive: isActive === undefined ? true : Boolean(isActive),
      createdById: createdById || null,
    },
  });
}

async function list() {
  return prisma.alertRule.findMany({ orderBy: { updatedAt: 'desc' } });
}

async function getById(id) {
  return prisma.alertRule.findUnique({ where: { id } });
}

async function updateById(id, data) {
  const patch = { ...data };
  if (patch.threshold !== undefined) patch.threshold = Number(patch.threshold);
  if (patch.message !== undefined) patch.message = String(patch.message);

  return prisma.alertRule.update({ where: { id }, data: patch });
}

async function deleteById(id) {
  return prisma.alertRule.delete({ where: { id } });
}

module.exports = {
  create,
  list,
  getById,
  updateById,
  deleteById,
};
