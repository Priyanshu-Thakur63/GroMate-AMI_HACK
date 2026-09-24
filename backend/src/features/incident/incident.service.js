const prisma = require('../../config/database');

class IncidentService {
  async getAll({ category, severity, status, zoneId, limit = 50 }) {
    const where = {};
    if (category) where.category = category;
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (zoneId) where.zoneId = zoneId;

    return await prisma.incidentReport.findMany({
      where,
      orderBy: { reportedAt: 'desc' },
      take: parseInt(limit, 10),
      include: { zone: true },
    });
  }

  async getById(id) {
    return await prisma.incidentReport.findUnique({
      where: { id },
      include: { zone: true },
    });
  }

  async create(data) {
    const {
      title,
      description,
      category,
      severity,
      latitude,
      longitude,
      zoneId,
      address,
      reporterName,
      reporterContact,
    } = data;

    return await prisma.incidentReport.create({
      data: {
        title,
        description,
        category: category || 'OTHER',
        severity: severity || 'MEDIUM',
        status: 'OPEN',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        zoneId: zoneId || null,
        address: address || null,
        reporterName: reporterName || null,
        reporterContact: reporterContact || null,
      },
      include: { zone: true },
    });
  }

  async update(id, data) {
    const { status, severity, description } = data;
    const updateData = {};

    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (severity) updateData.severity = severity;
    if (description) updateData.description = description;

    return await prisma.incidentReport.update({
      where: { id },
      data: updateData,
      include: { zone: true },
    });
  }

  async delete(id) {
    return await prisma.incidentReport.delete({
      where: { id },
    });
  }
}

module.exports = new IncidentService();
