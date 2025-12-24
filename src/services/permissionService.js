const prisma = require('../prismaClient');

function getDefaultModulesForAdmin() {
  return {
    admin: true,
    configuration: true,
    checklist: true,
    mint: true,
    energy: true,
    quality: true,
    console: true,
    productivity: true,
    'dfx-ai': true,
    'datonis-bi': true,
    documents: true,
    maintenance: true,
    designer: true,
  };
}

function getDefaultEnergySubRoutesForAdmin() {
  return {
    'digital-input': true,
    'digital-output': true,
    'analog-input': true,
    'analog-output': true,
    'machine-dashboard': true,
    'oee-dashboard': true,
    report: true,
    'energy-consumption': true,
    'energy-monitoring-dashboard': true,
    'power-quality-monitoring': true,
    alerts: true,
    'alert-setup': true,
    'event-data': true,
  };
}

function getDefaultPermissionsForRole(role) {
  if (role === 'ADMIN') {
    return {
      modules: getDefaultModulesForAdmin(),
      energySubRoutes: getDefaultEnergySubRoutesForAdmin(),
    };
  }

  // Matches the current frontend default for test@gmail.com
  return {
    modules: {
      admin: false,
      configuration: false,
      checklist: false,
      mint: false,
      energy: true,
      quality: true,
      console: true,
      productivity: false,
      'dfx-ai': false,
      'datonis-bi': false,
      documents: false,
      maintenance: false,
      designer: false,
    },
    energySubRoutes: {
      'digital-input': true,
      'digital-output': false,
      'analog-input': false,
      'analog-output': false,
      'machine-dashboard': false,
      'oee-dashboard': false,
      report: false,
      'energy-consumption': false,
      'energy-monitoring-dashboard': true,
      'power-quality-monitoring': false,
      alerts: false,
      'alert-setup': false,
      'event-data': false,
    },
  };
}

async function upsertDefaultPermissionsForUser(userId, role) {
  const defaults = getDefaultPermissionsForRole(role);
  return prisma.userPermission.upsert({
    where: { userId },
    create: {
      userId,
      modules: defaults.modules,
      energySubRoutes: defaults.energySubRoutes,
    },
    update: {
      modules: defaults.modules,
      energySubRoutes: defaults.energySubRoutes,
    },
  });
}

async function getAll() {
  return prisma.userPermission.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          user_name: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

async function getByUserId(userId) {
  return prisma.userPermission.findUnique({ where: { userId } });
}

async function updateByUserId(userId, data) {
  const { modules, energySubRoutes } = data || {};
  if (!modules || !energySubRoutes) {
    const err = new Error('modules and energySubRoutes are required');
    err.statusCode = 400;
    throw err;
  }

  return prisma.userPermission.upsert({
    where: { userId },
    create: { userId, modules, energySubRoutes },
    update: { modules, energySubRoutes },
  });
}

module.exports = {
  getDefaultPermissionsForRole,
  upsertDefaultPermissionsForUser,
  getAll,
  getByUserId,
  updateByUserId,
};
