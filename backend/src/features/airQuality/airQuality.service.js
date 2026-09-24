const prisma = require('../../config/database');

class AirQualityService {
  async getAll({ zoneId, limit = 50 }) {
    const where = zoneId ? { zoneId } : {};
    return await prisma.airQuality.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: parseInt(limit, 10),
      include: { zone: true },
    });
  }

  async getLatest() {
    const zones = await prisma.zone.findMany({
      include: {
        airQualityData: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    return zones.map((zone) => ({
      zoneId: zone.id,
      zoneName: zone.name,
      latestAQI: zone.airQualityData[0] || null,
    }));
  }

  async create(data) {
    const { zoneId, latitude, longitude, aqi, pm2_5, pm10, no2, o3, co, so2 } = data;
    const numericAqi = parseInt(aqi, 10);

    let category = 'GOOD';
    if (numericAqi > 300) category = 'HAZARDOUS';
    else if (numericAqi > 200) category = 'VERY_UNHEALTHY';
    else if (numericAqi > 150) category = 'UNHEALTHY';
    else if (numericAqi > 100) category = 'UNHEALTHY_SENSITIVE';
    else if (numericAqi > 50) category = 'MODERATE';

    return await prisma.airQuality.create({
      data: {
        zoneId: zoneId || null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        aqi: numericAqi,
        pm2_5: pm2_5 !== undefined ? parseFloat(pm2_5) : null,
        pm10: pm10 !== undefined ? parseFloat(pm10) : null,
        no2: no2 !== undefined ? parseFloat(no2) : null,
        o3: o3 !== undefined ? parseFloat(o3) : null,
        co: co !== undefined ? parseFloat(co) : null,
        so2: so2 !== undefined ? parseFloat(so2) : null,
        category,
      },
      include: { zone: true },
    });
  }
}

module.exports = new AirQualityService();
