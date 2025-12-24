/* eslint-disable no-console */
const prisma = require('../src/prismaClient');

async function main() {
  const countRows = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) AS duplicateGroups
    FROM (
      SELECT deviceId, ts
      FROM EnergyReading
      GROUP BY deviceId, ts
      HAVING COUNT(*) > 1
    ) t
  `);

  const duplicateGroups = Number(countRows?.[0]?.duplicateGroups || 0);

  const sample = await prisma.$queryRawUnsafe(`
    SELECT deviceId, ts, COUNT(*) AS cnt
    FROM EnergyReading
    GROUP BY deviceId, ts
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 20
  `);

  console.log('duplicate groups:', duplicateGroups);
  console.log(sample);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
