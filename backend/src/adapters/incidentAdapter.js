/**
 * CityPulse Incident Adapter
 * Converts raw citizen / municipal sensor incidents into Common Data Model (CDM)
 */

const SEVERITY_SCALE = {
  1: 'NORMAL',
  2: 'NORMAL',
  3: 'MODERATE',
  4: 'ELEVATED',
  5: 'CRITICAL'
};

const SEVERITY_ENUM_MAP = {
  1: 'LOW',
  2: 'LOW',
  3: 'MEDIUM',
  4: 'HIGH',
  5: 'CRITICAL'
};

function normalizeIncident(rawIncident, defaultZoneId) {
  const observedAt = new Date(rawIncident.reportedAt || Date.now());
  const ingestedAt = new Date();
  const severityInt = Math.min(5, Math.max(1, Number(rawIncident.severityLevel || rawIncident.severity || 3)));
  const zoneId = rawIncident.zoneId || defaultZoneId;

  const validCategories = [
    'WATERLOGGING', 'POWER_OUTAGE', 'FALLEN_TREE', 'TRAFFIC_JAM',
    'ROAD_DAMAGE', 'FIRE', 'GAS_LEAK', 'STRUCTURAL_COLLAPSE', 'OTHER'
  ];
  const rawCat = (rawIncident.category || 'OTHER').toUpperCase();
  const category = validCategories.includes(rawCat) ? rawCat : 'OTHER';

  const observation = {
    source: rawIncident.source || 'JAIPUR_INCIDENT_STREAM',
    category: 'INCIDENT',
    metricType: 'INCIDENT_EVENT',
    value: severityInt,
    unit: 'level_1_to_5',
    severity: SEVERITY_SCALE[severityInt] || 'MODERATE',
    latitude: Number(rawIncident.latitude || 26.9124),
    longitude: Number(rawIncident.longitude || 75.7873),
    zoneId,
    observedAt,
    ingestedAt,
    freshnessSeconds: 0,
    metadata: {
      title: rawIncident.title,
      description: rawIncident.description,
      incidentCategory: category,
      status: 'OPEN'
    }
  };

  return {
    observation,
    domainRecord: {
      zoneId,
      category,
      title: rawIncident.title,
      description: rawIncident.description || '',
      severity: SEVERITY_ENUM_MAP[severityInt] || 'MEDIUM',
      status: 'OPEN',
      latitude: Number(rawIncident.latitude || 26.9124),
      longitude: Number(rawIncident.longitude || 75.7873),
      reportedAt: observedAt
    }
  };
}

module.exports = {
  normalizeIncident,
  SEVERITY_SCALE
};
