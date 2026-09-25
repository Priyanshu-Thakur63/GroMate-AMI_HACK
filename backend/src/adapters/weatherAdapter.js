/**
 * CityPulse Weather Adapter (Open-Meteo Primary + OpenWeather Fallback)
 * Standardizes raw weather feeds into the Common Data Model (CDM)
 */

const WMO_CODE_MAP = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog & Mist',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  80: 'Rain Showers',
  81: 'Moderate Showers',
  82: 'Violent Showers',
  95: 'Thunderstorm with Rain'
};

function normalizeOpenMeteoWeather(rawData, zoneId) {
  if (!rawData || !rawData.current) {
    throw new Error('Invalid Open-Meteo weather payload');
  }

  const current = rawData.current;
  const observedAt = new Date(current.time ? `${current.time}:00.000Z` : Date.now());
  const ingestedAt = new Date();
  const freshnessSeconds = Math.max(0, Math.floor((ingestedAt.getTime() - observedAt.getTime()) / 1000));
  const weatherCode = Number(current.weather_code || 0);
  const condition = WMO_CODE_MAP[weatherCode] || 'Variable Weather';
  const precipitation = Number(current.precipitation || 0);
  const temperature = Number(current.temperature_2m || 30);
  const humidity = Number(current.relative_humidity_2m || 50);
  const windSpeed = Number(current.wind_speed_10m || 10);

  const observations = [
    {
      source: 'OPEN_METEO_WEATHER',
      category: 'WEATHER',
      metricType: 'TEMPERATURE',
      value: temperature,
      unit: 'celsius',
      severity: temperature >= 43 ? 'CRITICAL' : temperature >= 38 ? 'ELEVATED' : 'NORMAL',
      latitude: Number(rawData.latitude || 26.9124),
      longitude: Number(rawData.longitude || 75.7873),
      zoneId,
      observedAt,
      ingestedAt,
      freshnessSeconds,
      metadata: { humidity, windSpeed, condition }
    },
    {
      source: 'OPEN_METEO_WEATHER',
      category: 'WEATHER',
      metricType: 'RAINFALL',
      value: precipitation,
      unit: 'mm',
      severity: precipitation >= 25 ? 'CRITICAL' : precipitation >= 10 ? 'ELEVATED' : precipitation > 0 ? 'MODERATE' : 'NORMAL',
      latitude: Number(rawData.latitude || 26.9124),
      longitude: Number(rawData.longitude || 75.7873),
      zoneId,
      observedAt,
      ingestedAt,
      freshnessSeconds,
      metadata: { weatherCode, condition, windSpeed, humidity }
    }
  ];

  return {
    observations,
    domainSnapshot: {
      zoneId,
      latitude: Number(rawData.latitude || 26.9124),
      longitude: Number(rawData.longitude || 75.7873),
      temperature,
      humidity,
      precipitation,
      windSpeed,
      condition,
      weatherCode,
      recordedAt: observedAt
    }
  };
}

module.exports = {
  normalizeOpenMeteoWeather,
  WMO_CODE_MAP
};
