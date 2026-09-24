const prisma = require('../../config/database');

class WeatherService {
  async getAll({ zoneId, limit = 50 }) {
    const where = zoneId ? { zoneId } : {};
    return await prisma.weatherData.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: parseInt(limit, 10),
      include: { zone: true },
    });
  }

  async getLatest() {
    const zones = await prisma.zone.findMany({
      include: {
        weatherData: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });

    return zones.map((zone) => ({
      zoneId: zone.id,
      zoneName: zone.name,
      latestWeather: zone.weatherData[0] || null,
    }));
  }

  async getById(id) {
    return await prisma.weatherData.findUnique({
      where: { id },
      include: { zone: true },
    });
  }

  async create(data) {
    const {
      zoneId,
      latitude,
      longitude,
      temperature,
      humidity,
      precipitation,
      windSpeed,
      condition,
      weatherCode,
      alert,
    } = data;

    return await prisma.weatherData.create({
      data: {
        zoneId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity || 50),
        precipitation: parseFloat(precipitation || 0),
        windSpeed: parseFloat(windSpeed || 10),
        condition: condition || 'Clear',
        weatherCode: weatherCode ? parseInt(weatherCode, 10) : null,
        alert: alert || null,
      },
      include: { zone: true },
    });
  }
}

module.exports = new WeatherService();
