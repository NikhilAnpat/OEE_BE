/* eslint-disable no-console */
const prisma = require('../src/prismaClient');

async function main() {
  // Delete duplicates by (deviceId, ts), keeping the lowest id.
  // MySQL syntax:
  // DELETE e1 FROM EnergyReading e1
  // JOIN EnergyReading e2
  //   ON e1.deviceId = e2.deviceId AND e1.ts = e2.ts AND e1.id > e2.id;
  const sql = `
    DELETE e1
    FROM EnergyReading e1
    INNER JOIN EnergyReading e2
      ON e1.deviceId = e2.deviceId
      AND e1.ts = e2.ts
      AND e1.id > e2.id
  `;

  const deleted = await prisma.$executeRawUnsafe(sql);
  console.log('dedupe deleted rows:', deleted);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
