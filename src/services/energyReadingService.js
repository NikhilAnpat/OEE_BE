const prisma = require('../prismaClient');

async function create(data) {
  const { deviceId, ts, meterKW, meterKWH, raw } = data || {};
  if (!deviceId || !ts) {
    const err = new Error('deviceId and ts are required');
    err.statusCode = 400;
    throw err;
  }

  return prisma.energyReading.create({
    data: {
      deviceId,
      ts: new Date(ts),
      meterKW: meterKW === undefined || meterKW === null ? null : Number(meterKW),
      meterKWH: meterKWH === undefined || meterKWH === null ? null : Number(meterKWH),
      raw: raw === undefined ? null : raw,
    },
  });
}

async function list({ deviceId, start, end, limit = 5000 } = {}) {
  const where = {};
  if (deviceId) where.deviceId = deviceId;
  if (start || end) {
    where.ts = {};
    if (start) where.ts.gte = new Date(start);
    if (end) where.ts.lte = new Date(end);
  }

  const take = Math.min(5000, Math.max(1, Number(limit || 5000)));
  return prisma.energyReading.findMany({
    where,
    orderBy: { ts: 'asc' },
    take,
  });
}

async function kpi({ deviceId, start, end, costPerKwh = 7 } = {}) {
  const rows = await list({ deviceId, start, end, limit: 5000 });
  if (rows.length === 0) {
    return { totalConsumptionKWh: 0, totalCost: 0, maxDemandMW: 0, points: 0 };
  }

  // Frontend assumes ~1-minute interval and computes kWh as sum(kw * 1/60).
  const INTERVAL_HOURS = 1 / 60;
  let totalKWh = 0;
  let maxKW = 0;

  rows.forEach((r) => {
    const kw = typeof r.meterKW === 'number' ? r.meterKW : 0;
    totalKWh += kw * INTERVAL_HOURS;
    if (kw > maxKW) maxKW = kw;
  });

  return {
    totalConsumptionKWh: totalKWh,
    totalCost: totalKWh * Number(costPerKwh),
    maxDemandMW: maxKW / 1000,
    points: rows.length,
  };
}

module.exports = {
  create,
  list,
  kpi,
};
