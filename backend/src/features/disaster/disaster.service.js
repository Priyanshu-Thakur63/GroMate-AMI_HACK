const prisma = require('../../config/database');

class DisasterService {
  async getAll({ status, severity, disasterType, zoneId, limit = 50 }) {
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (disasterType) where.disasterType = disasterType;
    if (zoneId) where.zoneId = zoneId;

    return await prisma.disaster.findMany({
      where,
      orderBy: { declaredAt: 'desc' },
      take: parseInt(limit, 10),
      include: { zone: true },
    });
  }

  async getActive() {
    return await prisma.disaster.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { declaredAt: 'desc' },
      include: { zone: true },
    });
  }

  async getById(id) {
    return await prisma.disaster.findUnique({
      where: { id },
      include: { zone: true },
    });
  }

  async create(data) {
    const {
      title,
      disasterType,
      severity,
      description,
      instructions,
      affectedRadiusKm,
      latitude,
      longitude,
      zoneId,
    } = data;

    return await prisma.disaster.create({
      data: {
        title,
        disasterType: disasterType || 'OTHER',
        severity: severity || 'HIGH',
        status: 'ACTIVE',
        description,
        instructions: instructions || null,
        affectedRadiusKm: affectedRadiusKm ? parseFloat(affectedRadiusKm) : 5.0,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        zoneId: zoneId || null,
      },
      include: { zone: true },
    });
  }

  async update(id, data) {
    const { status, severity, instructions } = data;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.endedAt = new Date();
      }
    }
    if (severity) updateData.severity = severity;
    if (instructions) updateData.instructions = instructions;

    return await prisma.disaster.update({
      where: { id },
      data: updateData,
      include: { zone: true },
    });
  }
}

module.exports = new DisasterService();
