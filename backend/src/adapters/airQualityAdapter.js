/**
 * CityPulse Air Quality Adapter (Open-Meteo Air Quality)
 * Standardizes raw atmospheric pollution feeds into Common Data Model (CDM)
 */

function calculateIndianNAQI(pm25, pm10) {
  let aqi25 = 0;
  if (pm25 <= 30) aqi25 = (50 / 30) * pm25;
  else if (pm25 <= 60) aqi25 = 50 + ((50 / 30) * (pm25 - 30));
  else if (pm25 <= 90) aqi25 = 100 + ((100 / 30) * (pm25 - 60));
  else if (pm25 <= 120) aqi25 = 200 + ((100 / 30) * (pm25 - 90));
  else if (pm25 <= 250) aqi25 = 300 + ((100 / 130) * (pm25 - 120));
  else aqi25 = 400 + ((100 / 130) * (pm25 - 250));

  let category = 'GOOD';
  let severity = 'NORMAL';

  if (aqi25 > 350) { category = 'HAZARDOUS'; severity = 'CRITICAL'; }
  else if (aqi25 > 250) { category = 'VERY_UNHEALTHY'; severity = 'CRITICAL'; }
  else if (aqi25 > 150) { category = 'UNHEALTHY'; severity = 'ELEVATED'; }
  else if (aqi25 > 100) { category = 'UNHEALTHY_SENSITIVE'; severity = 'MODERATE'; }
  else if (aqi25 > 50) { category = 'MODERATE'; severity = 'NORMAL'; }

  return {
    aqi: Math.round(aqi25),
    category,
    severity
  };
}

function normalizeOpenMeteoAQ(rawData, zoneId) {
  if (!rawData || !rawData.current) {
    throw new Error('Invalid Open-Meteo Air Quality payload');
  }

  const current = rawData.current;
  const observedAt = new Date(current.time ? `${current.time}:00.000Z` : Date.now());
  const ingestedAt = new Date();
  const freshnessSeconds = Math.max(0, Math.floor((ingestedAt.getTime() - observedAt.getTime()) / 1000));
  
  const pm25 = Number(current.pm2_5 || 35);
  const pm10 = Number(current.pm10 || 70);
  const no2 = current.nitrogen_dioxide ? Number(current.nitrogen_dioxide) : null;
  const o3 = current.ozone ? Number(current.ozone) : null;

  const naqi = calculateIndianNAQI(pm25, pm10);

  const observations = [
    {
      source: 'OPEN_METEO_AQ',
      category: 'AIR_QUALITY',
      metricType: 'PM25',
      value: pm25,
      unit: 'ug/m3',
      severity: naqi.severity,
      latitude: Number(rawData.latitude || 26.9124),
      longitude: Number(rawData.longitude || 75.7873),
      zoneId,
      observedAt,
      ingestedAt,
      freshnessSeconds,
      metadata: {
        pm10,
        no2,
        o3,
        calculatedAqi: naqi.aqi,
        category: naqi.category
      }
    }
  ];

  return {
    observations,
    domainSnapshot: {
      zoneId,
      latitude: Number(rawData.latitude || 26.9124),
      longitude: Number(rawData.longitude || 75.7873),
      aqi: naqi.aqi,
      pm2_5: pm25,
      pm10,
      no2,
      o3,
      category: naqi.category,
      recordedAt: observedAt
    }
  };
}

module.exports = {
  normalizeOpenMeteoAQ,
  calculateIndianNAQI
};
