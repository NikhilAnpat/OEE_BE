const prisma = require('../prismaClient');

function parseIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function parseFloatOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

async function create(data) {
  const {
    eventId,
    meterId,
    occurredAt,
    avgCurrent,
    avgVoltage,
    avgPowerFactor,
    totalKW,
    totalKWH,
  } = data || {};

  if (
    eventId === undefined ||
    meterId === undefined ||
    !occurredAt
  ) {
    const err = new Error('eventId, meterId, occurredAt are required');
    err.statusCode = 400;
    throw err;
  }

  return prisma.eventRecord.create({
    data: {
      eventId: Number(eventId),
      meterId: Number(meterId),
      occurredAt: new Date(occurredAt),
      avgCurrent: Number(avgCurrent || 0),
      avgVoltage: Number(avgVoltage || 0),
      avgPowerFactor: Number(avgPowerFactor || 0),
      totalKW: Number(totalKW || 0),
      totalKWH: Number(totalKWH || 0),
    },
  });
}

async function list({ meterId, start, end, page = 1, limit = 10 } = {}) {
  const meter = parseIntOrNull(meterId);
  const pageNum = Math.max(1, Number(page || 1));
  const limitNum = Math.min(200, Math.max(1, Number(limit || 10)));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (meter !== null) where.meterId = meter;
  if (start || end) {
    where.occurredAt = {};
    if (start) where.occurredAt.gte = new Date(start);
    if (end) where.occurredAt.lte = new Date(end);
  }

  const [items, total] = await Promise.all([
    prisma.eventRecord.findMany({ where, orderBy: { occurredAt: 'desc' }, skip, take: limitNum }),
    prisma.eventRecord.count({ where }),
  ]);

  return { page: pageNum, limit: limitNum, total, items };
}

async function getById(id) {
  return prisma.eventRecord.findUnique({ where: { id } });
}

async function updateById(id, data) {
  const patch = { ...data };
  if (patch.eventId !== undefined) patch.eventId = Number(patch.eventId);
  if (patch.meterId !== undefined) patch.meterId = Number(patch.meterId);
  if (patch.occurredAt !== undefined) patch.occurredAt = new Date(patch.occurredAt);

  const floatFields = ['avgCurrent', 'avgVoltage', 'avgPowerFactor', 'totalKW', 'totalKWH'];
  floatFields.forEach((f) => {
    if (patch[f] !== undefined) patch[f] = Number(patch[f]);
  });

  return prisma.eventRecord.update({ where: { id }, data: patch });
}

async function deleteById(id) {
  return prisma.eventRecord.delete({ where: { id } });
}

module.exports = {
  create,
  list,
  getById,
  updateById,
  deleteById,
};
