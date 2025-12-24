const prisma = require('../prismaClient');

function parseIntOrDefault(value, defaultValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

async function list({ page = 1, limit = 10, start, end } = {}) {
  const pageNum = Math.max(1, parseIntOrDefault(page, 1));
  const limitNum = Math.min(100, Math.max(1, parseIntOrDefault(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (start || end) {
    where.occurredAt = {};
    if (start) where.occurredAt.gte = new Date(start);
    if (end) where.occurredAt.lte = new Date(end);
  }

  const [items, total] = await Promise.all([
    prisma.triggeredAlert.findMany({ where, orderBy: { occurredAt: 'desc' }, skip, take: limitNum }),
    prisma.triggeredAlert.count({ where }),
  ]);

  return {
    page: pageNum,
    limit: limitNum,
    total,
    items,
  };
}

async function create(data) {
  const { severity, message, meterLabel, parameter, value, ruleId, occurredAt } = data || {};
  if (!severity || !message) {
    const err = new Error('severity and message are required');
    err.statusCode = 400;
    throw err;
  }

  return prisma.triggeredAlert.create({
    data: {
      severity,
      message,
      meterLabel: meterLabel || null,
      parameter: parameter || null,
      value: value === undefined || value === null ? null : Number(value),
      ruleId: ruleId === undefined || ruleId === null ? null : Number(ruleId),
      occurredAt: occurredAt ? new Date(occurredAt) : undefined,
    },
  });
}

async function deleteById(id) {
  return prisma.triggeredAlert.delete({ where: { id } });
}

module.exports = {
  list,
  create,
  deleteById,
};
