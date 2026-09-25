/**
 * CityPulse Live Ingestion & Multi-Source Normalization Engine
 * Orchestrates live API fetching (OpenWeather, Open-Meteo, Air Pollution, GNews, Incidents),
 * adapter transformation, database persistence, anomaly detection, and cross-source correlation.
 */

const { prisma } = require('../../config/database');
const { normalizeOpenMeteoWeather } = require('../../adapters/weatherAdapter');
const { normalizeOpenMeteoAQ } = require('../../adapters/airQualityAdapter');
const { normalizeIncident } = require('../../adapters/incidentAdapter');
const { normalizeNewsSentiment } = require('../../adapters/sentimentAdapter');
const anomalyService = require('../../analytics/anomaly.service');
const correlationService = require('../../analytics/correlation.service');

class IngestionService {
  /**
   * 1. WEATHER: Fetches real-time weather from OpenWeatherMap (or Open-Meteo fallback)
   */
  async fetchLiveWeather(latitude, longitude) {
    const owKey = process.env.OPENWEATHER_API_KEY;

    if (owKey && owKey.trim() !== '') {
      try {
        const owUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${owKey}&units=metric`;
        const res = await fetch(owUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          return {
            latitude,
            longitude,
            current: {
              time: new Date().toISOString().slice(0, 16),
              temperature_2m: data.main.temp,
              relative_humidity_2m: data.main.humidity,
              precipitation: data.rain ? data.rain['1h'] || 0 : 0,
              wind_speed_10m: (data.wind.speed * 3.6).toFixed(1),
              weather_code: data.weather[0]?.id || 0,
            }
          };
        }
      } catch (owErr) {
        console.warn('[Weather API] OpenWeather fallback to Open-Meteo:', owErr.message);
      }
    }

    // High-reliability Live Open-Meteo REST API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Open-Meteo weather API returned ${res.status}`);
    return res.json();
  }

  /**
   * 2. AIR QUALITY: Fetches real-time atmospheric data from OpenWeather Air Pollution / Open-Meteo
   */
  async fetchLiveAirQuality(latitude, longitude) {
    const owKey = process.env.OPENWEATHER_API_KEY;

    if (owKey && owKey.trim() !== '') {
      try {
        const owPollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${owKey}`;
        const res = await fetch(owPollutionUrl, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          const comp = data.list[0]?.components || {};
          return {
            latitude,
            longitude,
            current: {
              time: new Date().toISOString().slice(0, 16),
              pm2_5: comp.pm2_5 || 30,
              pm10: comp.pm10 || 40,
              nitrogen_dioxide: comp.no2 || 10,
              ozone: comp.o3 || 25,
            }
          };
        }
      } catch (owErr) {
        console.warn('[AirQuality API] OpenWeather pollution fallback to Open-Meteo:', owErr.message);
      }
    }

    // Live Open-Meteo Copernicus CAMS feed
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5,nitrogen_dioxide,ozone,european_aqi,us_aqi`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Open-Meteo AQ API returned ${res.status}`);
    return res.json();
  }

  /**
   * 3. SOCIAL / NEWS SENTIMENT: Queries live sentiment for Jaipur zones
   */
  async fetchLiveSentiment(zone) {
    const gnewsKey = process.env.GNEWS_API_KEY;

    if (gnewsKey && gnewsKey.trim() !== '') {
      try {
        const query = encodeURIComponent(`Jaipur ${zone.name} civic traffic rain`);
        const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&token=${gnewsKey}&max=5`;
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const data = await res.json();
          if (data.articles && data.articles.length > 0) {
            for (const article of data.articles) {
              await this.ingestSentiment(article, zone.id);
            }
            return { status: 'LIVE_GNEWS', count: data.articles.length };
          }
        }
      } catch (gnewsErr) {
        console.warn('[Sentiment API] GNews fetch error:', gnewsErr.message);
      }
    }

    return { status: 'STANDBY', count: 0 };
  }

  /**
   * Synchronizes all Jaipur civic zones with live and normalized data
   */
  async syncAllZones() {
    const zones = await prisma.zone.findMany();
    const results = [];

    for (const zone of zones) {
      const zoneSummary = {
        zoneCode: zone.code,
        zoneName: zone.name,
        weatherStatus: 'LIVE_OPENWEATHER',
        aqStatus: 'LIVE_AIR_POLLUTION',
        sentimentStatus: 'OK',
        observationsCreated: 0,
        anomaliesDetected: 0,
        correlationsDetected: 0
      };

      try {
        // 1. Weather
        try {
          const rawWeather = await this.fetchLiveWeather(zone.latitude, zone.longitude);
          const normalized = normalizeOpenMeteoWeather(rawWeather, zone.id);

          await prisma.weatherData.create({ data: normalized.domainSnapshot });

          for (const obs of normalized.observations) {
            await prisma.civicObservation.create({ data: obs });
            zoneSummary.observationsCreated++;
          }
        } catch (wErr) {
          zoneSummary.weatherStatus = `DEGRADED: ${wErr.message}`;
        }

        // 2. Air Quality
        try {
          const rawAQ = await this.fetchLiveAirQuality(zone.latitude, zone.longitude);
          const normalizedAQ = normalizeOpenMeteoAQ(rawAQ, zone.id);

          await prisma.airQuality.create({ data: normalizedAQ.domainSnapshot });

          for (const obs of normalizedAQ.observations) {
            await prisma.civicObservation.create({ data: obs });
            zoneSummary.observationsCreated++;
          }
        } catch (aqErr) {
          zoneSummary.aqStatus = `DEGRADED: ${aqErr.message}`;
        }

        // 3. Social Sentiment
        try {
          const sentResult = await this.fetchLiveSentiment(zone);
          zoneSummary.sentimentStatus = sentResult.status;
        } catch (_) {}

        // 4. Run Anomaly Detection
        const anomalies = await anomalyService.detectAnomaliesForZone(zone.id);
        zoneSummary.anomaliesDetected = anomalies.length;

        // 5. Run Correlation Engine
        const correlations = await correlationService.evaluateZoneCorrelations(zone.id);
        zoneSummary.correlationsDetected = correlations.length;

        results.push(zoneSummary);
      } catch (zoneErr) {
        results.push({
          zoneCode: zone.code,
          error: zoneErr.message
        });
      }
    }

    return results;
  }

  /**
   * Ingests a new incident through the incident adapter
   */
  async ingestIncident(rawPayload, zoneId) {
    const { observation, domainRecord } = normalizeIncident(rawPayload, zoneId);

    const incident = await prisma.incidentReport.create({ data: domainRecord });
    await prisma.civicObservation.create({ data: observation });
    await correlationService.evaluateZoneCorrelations(zoneId);

    return incident;
  }

  /**
   * Ingests news or social sentiment through the sentiment adapter
   */
  async ingestSentiment(rawPayload, zoneId) {
    const { observation, domainRecord } = normalizeNewsSentiment(rawPayload, zoneId);

    const sentiment = await prisma.socialSentiment.create({ data: domainRecord });
    await prisma.civicObservation.create({ data: observation });
    await correlationService.evaluateZoneCorrelations(zoneId);

    return sentiment;
  }
}

module.exports = new IngestionService();
