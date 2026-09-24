export const cityData = [
  {
    id: 1,
    location: "Tonk Road",
    area: "South Jaipur",
    traffic: {
      index: 72,
      change: 32,
      level: "High",
    },
    rainfall: {
      current: 18,
      previous: 8,
      change: 125,
      unit: "mm",
    },
    incidents: {
      count: 2,
      type: "Waterlogging",
    },
    roads: {
      blocked: 3,
      affected: 5,
    },
    risk: {
      score: 86,
      level: "High",
    },
    coordinates: {
      x: 70,
      y: 58,
    },
    timestamp: "17:42",
  },

  {
    id: 2,
    location: "MI Road",
    area: "Central Jaipur",
    traffic: {
      index: 76,
      change: 32,
      level: "High",
    },
    rainfall: {
      current: 12,
      previous: 9,
      change: 33,
      unit: "mm",
    },
    incidents: {
      count: 1,
      type: "Traffic Congestion",
    },
    roads: {
      blocked: 1,
      affected: 2,
    },
    risk: {
      score: 68,
      level: "Moderate",
    },
    coordinates: {
      x: 52,
      y: 38,
    },
    timestamp: "17:31",
  },

  {
    id: 3,
    location: "Ajmer Road",
    area: "West Jaipur",
    traffic: {
      index: 88,
      change: 41,
      level: "Critical",
    },
    rainfall: {
      current: 15,
      previous: 7,
      change: 114,
      unit: "mm",
    },
    incidents: {
      count: 3,
      type: "Road Incident",
    },
    roads: {
      blocked: 2,
      affected: 4,
    },
    risk: {
      score: 91,
      level: "Critical",
    },
    coordinates: {
      x: 24,
      y: 43,
    },
    timestamp: "17:18",
  },

  {
    id: 4,
    location: "Mansarovar",
    area: "South-West Jaipur",
    traffic: {
      index: 61,
      change: 18,
      level: "Moderate",
    },
    rainfall: {
      current: 11,
      previous: 8,
      change: 38,
      unit: "mm",
    },
    incidents: {
      count: 1,
      type: "Road Closure",
    },
    roads: {
      blocked: 2,
      affected: 3,
    },
    risk: {
      score: 64,
      level: "Moderate",
    },
    coordinates: {
      x: 42,
      y: 61,
    },
    timestamp: "17:02",
  },

  {
    id: 5,
    location: "Malviya Nagar",
    area: "South-East Jaipur",
    traffic: {
      index: 55,
      change: 12,
      level: "Moderate",
    },
    rainfall: {
      current: 9,
      previous: 7,
      change: 29,
      unit: "mm",
    },
    incidents: {
      count: 1,
      type: "Rainfall",
    },
    roads: {
      blocked: 0,
      affected: 1,
    },
    risk: {
      score: 48,
      level: "Low",
    },
    coordinates: {
      x: 72,
      y: 74,
    },
    timestamp: "16:51",
  },

  {
    id: 6,
    location: "C-Scheme",
    area: "Central Jaipur",
    traffic: {
      index: 42,
      change: 5,
      level: "Normal",
    },
    rainfall: {
      current: 6,
      previous: 5,
      change: 20,
      unit: "mm",
    },
    incidents: {
      count: 0,
      type: null,
    },
    roads: {
      blocked: 0,
      affected: 0,
    },
    risk: {
      score: 31,
      level: "Low",
    },
    coordinates: {
      x: 46,
      y: 27,
    },
    timestamp: "16:43",
  },

  {
    id: 7,
    location: "Amer",
    area: "North-East Jaipur",
    traffic: {
      index: 38,
      change: -8,
      level: "Normal",
    },
    rainfall: {
      current: 4,
      previous: 5,
      change: -20,
      unit: "mm",
    },
    incidents: {
      count: 0,
      type: null,
    },
    roads: {
      blocked: 0,
      affected: 0,
    },
    risk: {
      score: 24,
      level: "Low",
    },
    coordinates: {
      x: 82,
      y: 28,
    },
    timestamp: "16:37",
  },
];

export const citySummary = {
  trafficIndex: 64,
  rainfall: 18,
  activeAlerts: 7,
  affectedZones: 12,
  cityRiskScore: 78,
  normalZones: 68,
  elevatedZones: 24,
  criticalZones: 8,
};

export const hourlyTrend = [
  { time: "6 AM", traffic: 52, rainfall: 2 },
  { time: "8 AM", traffic: 54, rainfall: 3 },
  { time: "10 AM", traffic: 58, rainfall: 5 },
  { time: "12 PM", traffic: 68, rainfall: 12 },
  { time: "2 PM", traffic: 76, rainfall: 18 },
  { time: "3 PM", traffic: 64, rainfall: 30 },
  { time: "4 PM", traffic: 68, rainfall: 18 },
  { time: "6 PM", traffic: 61, rainfall: 10 },
  { time: "9 PM", traffic: 52, rainfall: 5 },
];

export const eventFeed = [
  {
    id: 1,
    time: "5 min ago",
    type: "rainfall",
    title: "Waterlogging detected",
    location: "Tonk Road, Jaipur",
    value: "+125%",
    severity: "High",
    description: "Heavy rainfall causing water accumulation",
  },
  {
    id: 2,
    time: "12 min ago",
    type: "traffic",
    title: "Traffic congestion increased",
    location: "MI Road, Jaipur",
    value: "+32%",
    severity: "Medium",
    description: "Traffic density 48% above normal",
  },
  {
    id: 3,
    time: "18 min ago",
    type: "road",
    title: "Road closure",
    location: "Ajmer Road, Jaipur",
    value: "2 roads",
    severity: "High",
    description: "Road segment temporarily closed",
  },
  {
    id: 4,
    time: "25 min ago",
    type: "rainfall",
    title: "Rainfall warning",
    location: "Mansarovar, Jaipur",
    value: "+38%",
    severity: "Medium",
    description: "Heavy rainfall expected in next 1 hour",
  },
];