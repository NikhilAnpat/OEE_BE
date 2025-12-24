/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const prisma = require('../src/prismaClient');
const permissionService = require('../src/services/permissionService');

async function upsertUser({ email, user_name, password, role, full_name, company_name, mobile_no }) {
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      user_name,
      password,
      role,
      full_name: full_name ?? null,
      company_name: company_name ?? null,
      mobile_no: mobile_no ?? null,
      status: 'ACTIVE',
    },
    update: {
      user_name,
      password,
      role,
      full_name: full_name ?? null,
      company_name: company_name ?? null,
      mobile_no: mobile_no ?? null,
      status: 'ACTIVE',
    },
  });

  await permissionService.upsertDefaultPermissionsForUser(user.id, role);
  return user;
}

async function ensureAlertRule({ createdById, meterLabel, parameter, threshold, message, isActive = true }) {
  const existing = await prisma.alertRule.findFirst({
    where: { createdById, meterLabel, parameter, threshold, message },
  });

  if (existing) {
    return prisma.alertRule.update({
      where: { id: existing.id },
      data: { isActive },
    });
  }

  return prisma.alertRule.create({
    data: { createdById, meterLabel, parameter, threshold, message, isActive },
  });
}

async function ensureTriggeredAlert({ severity, message, occurredAt, ruleId = null, meterLabel = null, parameter = null, value = null }) {
  const occurred = occurredAt ? new Date(occurredAt) : new Date();
  const existing = await prisma.triggeredAlert.findFirst({
    where: {
      severity,
      message,
      occurredAt: occurred,
    },
  });

  if (existing) return existing;

  return prisma.triggeredAlert.create({
    data: {
      severity,
      message,
      occurredAt: occurred,
      ruleId,
      meterLabel,
      parameter,
      value: value === null || value === undefined ? null : Number(value),
    },
  });
}

function toIsoLocal(dateTimeStr) {
  // Converts "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  if (!dateTimeStr) return null;
  return String(dateTimeStr).trim().replace(' ', 'T');
}

async function seedEventRecords() {
  // Mirrors the sample rows in OEE/src/pages/EventData/EventData.jsx
  const sample = [
    { eventId: 6607, meterId: 101, occurredAt: '2025-09-09 20:08:00', avgCurrent: 25.47, avgVoltage: 230.10, avgPowerFactor: 0.98, totalKW: 17.50, totalKWH: 1024.75 },
    { eventId: 6592, meterId: 102, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 7592, meterId: 103, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 9592, meterId: 104, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 9492, meterId: 105, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 3592, meterId: 106, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 3192, meterId: 107, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 7692, meterId: 108, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 1692, meterId: 109, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 2692, meterId: 110, occurredAt: '2025-09-09 14:29:51', avgCurrent: 28.18, avgVoltage: 229.62, avgPowerFactor: 0.98, totalKW: 5.43, totalKWH: 304.11 },
    { eventId: 6618, meterId: 111, occurredAt: '2025-12-17 09:08:00', avgCurrent: 26.47, avgVoltage: 231.10, avgPowerFactor: 0.99, totalKW: 18.50, totalKWH: 1025.75 },
    { eventId: 6619, meterId: 112, occurredAt: '2025-12-17 09:08:00', avgCurrent: 27.47, avgVoltage: 232.10, avgPowerFactor: 0.97, totalKW: 19.50, totalKWH: 1026.75 },
  ];

  let createdOrUpdated = 0;
  // EventRecord has unique(eventId), so we can upsert safely.
  // eslint-disable-next-line no-restricted-syntax
  for (const row of sample) {
    await prisma.eventRecord.upsert({
      where: { eventId: row.eventId },
      create: {
        eventId: row.eventId,
        meterId: row.meterId,
        occurredAt: new Date(toIsoLocal(row.occurredAt)),
        avgCurrent: row.avgCurrent,
        avgVoltage: row.avgVoltage,
        avgPowerFactor: row.avgPowerFactor,
        totalKW: row.totalKW,
        totalKWH: row.totalKWH,
      },
      update: {
        meterId: row.meterId,
        occurredAt: new Date(toIsoLocal(row.occurredAt)),
        avgCurrent: row.avgCurrent,
        avgVoltage: row.avgVoltage,
        avgPowerFactor: row.avgPowerFactor,
        totalKW: row.totalKW,
        totalKWH: row.totalKWH,
      },
    });
    createdOrUpdated += 1;
  }

  return createdOrUpdated;
}

async function seedEnergyReadingsFromFrontendJson() {
  // Optional: import OEE frontend sample data if present.
  const dataPath = path.resolve(__dirname, '..', '..', 'OEE', 'src', 'services', 'Data.json');
  if (!fs.existsSync(dataPath)) {
    return { imported: 0, skipped: 0, source: null };
  }

  const text = fs.readFileSync(dataPath, 'utf8');
  const rows = JSON.parse(text);
  if (!Array.isArray(rows) || rows.length === 0) {
    return { imported: 0, skipped: 0, source: dataPath };
  }

  // Limit import to keep seed fast (configurable).
  // - SEED_ENERGY_LIMIT=0 => import all
  // - default => 1000
  const limitEnv = Number(process.env.SEED_ENERGY_LIMIT ?? 1000);
  const LIMIT = Number.isFinite(limitEnv) && limitEnv > 0 ? Math.min(limitEnv, rows.length) : rows.length;
  const slice = rows.slice(0, LIMIT);

  const data = [];
  let skipped = 0;

  slice.forEach((r) => {
    const deviceId = r.DeviceId || r.deviceId;
    const ts = r.ts;
    if (!deviceId || !ts) {
      skipped += 1;
      return;
    }

    data.push({
      deviceId: String(deviceId),
      ts: new Date(ts),
      meterKW: typeof r['Meter:KW'] === 'number' ? r['Meter:KW'] : null,
      meterKWH: typeof r['Meter:KWH'] === 'number' ? r['Meter:KWH'] : null,
      raw: r,
    });
  });

  if (data.length === 0) {
    return { imported: 0, skipped, source: dataPath };
  }

  // Requires @@unique([deviceId, ts]) to work well.
  const result = await prisma.energyReading.createMany({
    data,
    skipDuplicates: true,
  });

  return { imported: result.count, skipped, source: dataPath, attempted: data.length, limit: LIMIT };
}

async function main() {
  const admin = await upsertUser({
    email: 'nikhil@gmail.com',
    user_name: 'nikhil',
    password: '1234',
    role: 'ADMIN',
    full_name: 'Nikhil Admin',
    company_name: 'DFX',
    mobile_no: '9999999999',
  });

  const user = await upsertUser({
    email: 'test@gmail.com',
    user_name: 'test',
    password: '1234',
    role: 'USER',
    full_name: 'Test User',
    company_name: 'DFX',
    mobile_no: '8888888888',
  });

  // Alert rules similar to Alert Setup UI defaults
  const rule1 = await ensureAlertRule({
    createdById: admin.id,
    meterLabel: '101 - Shop-1',
    parameter: 'AvgVoltage',
    threshold: 240,
    message: 'Voltage too high',
    isActive: true,
  });

  await ensureAlertRule({
    createdById: admin.id,
    meterLabel: '102 - Shop-2',
    parameter: 'AvgCurrent',
    threshold: 30,
    message: 'Current exceeded threshold',
    isActive: true,
  });

  // A couple of triggered alerts for the Alerts UI
  await ensureTriggeredAlert({
    severity: 'CRITICAL',
    message: 'Machine M1 - OEE dropped below 70%',
    occurredAt: new Date().toISOString(),
  });

  await ensureTriggeredAlert({
    severity: 'WARNING',
    message: 'Machine M2 - Availability below threshold',
    occurredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  });

  await ensureTriggeredAlert({
    severity: 'CRITICAL',
    message: 'Threshold breach detected',
    occurredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    ruleId: rule1.id,
    meterLabel: rule1.meterLabel,
    parameter: rule1.parameter,
    value: rule1.threshold + 1,
  });

  const eventCount = await seedEventRecords();
  const energyImport = await seedEnergyReadingsFromFrontendJson();

  console.log('Seed users:', { admin: admin.email, user: user.email });
  console.log('Seed event records:', eventCount);
  console.log('Seed energy readings:', energyImport);

  console.log('Seed complete');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
