const prisma = require('../../config/database');

class ZoneService {
  async getAll() {
    return await prisma.zone.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getById(id) {
    return await prisma.zone.findUnique({
      where: { id },
      include: {
        weatherData: { orderBy: { recordedAt: 'desc' }, take: 5 },
        airQualityData: { orderBy: { recordedAt: 'desc' }, take: 5 },
        incidentReports: { where: { status: { not: 'RESOLVED' } } },
        socialSentiments: { orderBy: { postedAt: 'desc' }, take: 5 },
        disasters: { where: { status: 'ACTIVE' } },
      },
    });
  }

  async create(data) {
    const { name, code, city, state, latitude, longitude, radiusKm } = data;
    return await prisma.zone.create({
      data: {
        name,
        code,
        city: city || 'Jaipur',
        state: state || 'Rajasthan',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radiusKm: radiusKm ? parseFloat(radiusKm) : 5.0,
      },
    });
  }
}

module.exports = new ZoneService();
