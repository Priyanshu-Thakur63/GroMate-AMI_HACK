const prisma = require('../config/database');

async function seedDatabase() {
  console.log('[Database Seeder] Seeding CityPulse Jaipur, Rajasthan civic data...');

  try {
    // 1. Clean existing records in reverse dependency order
    await prisma.pulseScoreLog.deleteMany();
    await prisma.disaster.deleteMany();
    await prisma.socialSentiment.deleteMany();
    await prisma.airQuality.deleteMany();
    await prisma.incidentReport.deleteMany();
    await prisma.weatherData.deleteMany();
    await prisma.zone.deleteMany();

    // 2. Create Jaipur Neighborhood Zones with accurate coordinates
    const pinkCity = await prisma.zone.create({
      data: {
        name: 'Walled City (Pink City & Johari Bazaar)',
        code: 'JPR-WC-01',
        city: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.9239,
        longitude: 75.8267,
        radiusKm: 3.0,
      },
    });

    const cScheme = await prisma.zone.create({
      data: {
        name: 'C-Scheme & MI Road Commercial Hub',
        code: 'JPR-CS-02',
        city: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.9124,
        longitude: 75.8010,
        radiusKm: 3.5,
      },
    });

    const malviyaNagar = await prisma.zone.create({
      data: {
        name: 'Malviya Nagar & Jawahar Circle',
        code: 'JPR-MN-03',
        city: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.8530,
        longitude: 75.8048,
        radiusKm: 4.5,
      },
    });

    const mansarovar = await prisma.zone.create({
      data: {
        name: 'Mansarovar & Metro Corridor',
        code: 'JPR-MS-04',
        city: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.8620,
        longitude: 75.7580,
        radiusKm: 5.0,
      },
    });

    const vaishaliNagar = await prisma.zone.create({
      data: {
        name: 'Vaishali Nagar & Queens Road',
        code: 'JPR-VN-05',
        city: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.9056,
        longitude: 75.7410,
        radiusKm: 4.0,
      },
    });

    const sitapura = await prisma.zone.create({
      data: {
        name: 'Sitapura Industrial & Institutional Area',
        code: 'JPR-ST-06',
        city: 'Jaipur',
        state: 'Rajasthan',
        latitude: 26.7725,
        longitude: 75.8360,
        radiusKm: 6.0,
      },
    });

    console.log('[Database Seeder] 6 Jaipur Civic Zones created.');

    // 3. Jaipur Weather Data (Monsoon Cloudburst / High Heat situation)
    await prisma.weatherData.createMany({
      data: [
        {
          zoneId: pinkCity.id,
          latitude: pinkCity.latitude,
          longitude: pinkCity.longitude,
          temperature: 31.5,
          humidity: 89,
          precipitation: 48.5, // Heavy Monsoon Downpour
          windSpeed: 42.0,
          condition: 'Heavy Monsoon Downpour & Squall',
          weatherCode: 95,
          alert: 'Urban Waterlogging & Flash Flood Advisory (IMD Jaipur)',
        },
        {
          zoneId: cScheme.id,
          latitude: cScheme.latitude,
          longitude: cScheme.longitude,
          temperature: 32.0,
          humidity: 82,
          precipitation: 32.0,
          windSpeed: 35.0,
          condition: 'Thunderstorm & Gusty Winds',
          weatherCode: 95,
          alert: 'Traffic Congestion Alert on MI Road',
        },
        {
          zoneId: malviyaNagar.id,
          latitude: malviyaNagar.latitude,
          longitude: malviyaNagar.longitude,
          temperature: 33.2,
          humidity: 74,
          precipitation: 14.5,
          windSpeed: 22.0,
          condition: 'Moderate Rain',
          weatherCode: 61,
          alert: null,
        },
        {
          zoneId: mansarovar.id,
          latitude: mansarovar.latitude,
          longitude: mansarovar.longitude,
          temperature: 33.0,
          humidity: 72,
          precipitation: 8.0,
          windSpeed: 18.0,
          condition: 'Scattered Showers',
          weatherCode: 51,
          alert: null,
        },
        {
          zoneId: vaishaliNagar.id,
          latitude: vaishaliNagar.latitude,
          longitude: vaishaliNagar.longitude,
          temperature: 34.0,
          humidity: 68,
          precipitation: 3.5,
          windSpeed: 16.0,
          condition: 'Overcast & Humid',
          weatherCode: 3,
          alert: null,
        },
        {
          zoneId: sitapura.id,
          latitude: sitapura.latitude,
          longitude: sitapura.longitude,
          temperature: 35.5,
          humidity: 62,
          precipitation: 0.0,
          windSpeed: 25.0,
          condition: 'Dusty & Strong Winds',
          weatherCode: 6,
          alert: 'Industrial Dust & PM10 Spike Advisory',
        },
      ],
    });

    console.log('[Database Seeder] Jaipur Weather data seeded.');

    // 4. Incident Reports (Jaipur Nagar Nigam 311 Complaints)
    await prisma.incidentReport.createMany({
      data: [
        {
          zoneId: pinkCity.id,
          title: 'Sanganeri Gate Underpass Waterlogging',
          description: 'Rainwater accumulation over 3 feet near Sanganeri Gate & Badi Chaupar. E-rickshaws and two-wheelers halted.',
          category: 'WATERLOGGING',
          severity: 'HIGH',
          status: 'OPEN',
          address: 'Sanganeri Gate, Johari Bazaar Road, Jaipur',
          latitude: 26.9180,
          longitude: 75.8240,
          reporterName: 'Sunil Sharma (Shopkeeper)',
          reporterContact: '+91-98290-XXXXX',
        },
        {
          zoneId: pinkCity.id,
          title: 'JVVNL Feeder Trip near Tripolia Bazaar',
          description: 'Power transformer spark after lightning strike. 4 commercial market lanes without power.',
          category: 'POWER_OUTAGE',
          severity: 'CRITICAL',
          status: 'IN_PROGRESS',
          address: 'Tripolia Bazaar near City Palace Gate',
          latitude: 26.9248,
          longitude: 75.8235,
          reporterName: 'Jaipur Vidyut Vitran Nigam Line Patrol',
          reporterContact: '1912',
        },
        {
          zoneId: cScheme.id,
          title: 'Major Traffic Gridlock on Panch Batti & MI Road',
          description: 'Traffic signals disabled due to power surge. Bumper to bumper backup extending to Ajmeri Gate.',
          category: 'TRAFFIC_JAM',
          severity: 'HIGH',
          status: 'OPEN',
          address: 'Panch Batti Crossing, MI Road, Jaipur',
          latitude: 26.9165,
          longitude: 75.8115,
          reporterName: 'Jaipur Traffic Police Head Constable #108',
        },
        {
          zoneId: cScheme.id,
          title: 'Old Neem Tree Branch Fallen on Statue Circle',
          description: 'Heavy branch blocking partial roundabout lane at Statue Circle. JDA horticulture team notified.',
          category: 'FALLEN_TREE',
          severity: 'MEDIUM',
          status: 'IN_PROGRESS',
          address: 'Statue Circle, Bhagwan Das Road',
          latitude: 26.9078,
          longitude: 75.8062,
          reporterName: 'Morning Walker Association',
        },
        {
          zoneId: mansarovar.id,
          title: 'Dravyavati River Catchment Overflow near Shipra Path',
          description: 'Drainage channel silt blockage causing localized overflow on service road.',
          category: 'WATERLOGGING',
          severity: 'MEDIUM',
          status: 'OPEN',
          address: 'Shipra Path, Mansarovar Sector 5, Jaipur',
          latitude: 26.8580,
          longitude: 75.7620,
          reporterName: 'Resident Vikas Meena',
        },
        {
          zoneId: sitapura.id,
          title: 'Chemical Warehouse Smoke & Odor Spill',
          description: 'Minor solvent leak at chemical dye manufacturing unit. Fire brigade stationed on alert.',
          category: 'GAS_LEAK',
          severity: 'HIGH',
          status: 'IN_PROGRESS',
          address: 'RIICO Industrial Area, Phase 3, Sitapura',
          latitude: 26.7750,
          longitude: 75.8390,
          reporterName: 'RIICO Industrial Safety Inspector',
        },
      ],
    });

    console.log('[Database Seeder] Jaipur 311 Civic Incidents seeded.');

    // 5. Jaipur Air Quality Data (RSPCB Sensor Stations)
    await prisma.airQuality.createMany({
      data: [
        {
          zoneId: pinkCity.id,
          latitude: pinkCity.latitude,
          longitude: pinkCity.longitude,
          aqi: 145,
          pm2_5: 68.0,
          pm10: 135.0,
          no2: 44.0,
          category: 'UNHEALTHY_SENSITIVE',
        },
        {
          zoneId: cScheme.id,
          latitude: cScheme.latitude,
          longitude: cScheme.longitude,
          aqi: 110,
          pm2_5: 48.0,
          pm10: 98.0,
          no2: 38.0,
          category: 'UNHEALTHY_SENSITIVE',
        },
        {
          zoneId: malviyaNagar.id,
          latitude: malviyaNagar.latitude,
          longitude: malviyaNagar.longitude,
          aqi: 65,
          pm2_5: 22.0,
          pm10: 52.0,
          no2: 24.0,
          category: 'MODERATE',
        },
        {
          zoneId: mansarovar.id,
          latitude: mansarovar.latitude,
          longitude: mansarovar.longitude,
          aqi: 72,
          pm2_5: 28.0,
          pm10: 60.0,
          no2: 26.0,
          category: 'MODERATE',
        },
        {
          zoneId: vaishaliNagar.id,
          latitude: vaishaliNagar.latitude,
          longitude: vaishaliNagar.longitude,
          aqi: 58,
          pm2_5: 18.0,
          pm10: 45.0,
          no2: 19.0,
          category: 'MODERATE',
        },
        {
          zoneId: sitapura.id,
          latitude: sitapura.latitude,
          longitude: sitapura.longitude,
          aqi: 225, // Industrial dust/emissions
          pm2_5: 115.0,
          pm10: 240.0,
          no2: 78.0,
          so2: 32.0,
          category: 'VERY_UNHEALTHY',
        },
      ],
    });

    console.log('[Database Seeder] Jaipur Air Quality measurements seeded.');

    // 6. Social Sentiment Feed (Jaipur Twitter/X, Citizen App, Local Forums)
    await prisma.socialSentiment.createMany({
      data: [
        {
          zoneId: pinkCity.id,
          platform: 'Twitter / Jaipur Live',
          content: 'Badi Chaupar and Sanganeri Gate are completely waterlogged after 1 hour of rain! Avoid taking cars into the Walled City today!',
          sentimentScore: -0.88,
          sentimentLabel: 'URGENT',
          keywords: ['jaipur-rain', 'waterlogging', 'walled-city', 'traffic'],
        },
        {
          zoneId: cScheme.id,
          platform: 'Jaipur Citizen Connect',
          content: 'Stuck at Panch Batti crossing for 40 minutes. Traffic lights are completely dead after the storm.',
          sentimentScore: -0.75,
          sentimentLabel: 'NEGATIVE',
          keywords: ['mi-road', 'traffic', 'power-cut'],
        },
        {
          zoneId: malviyaNagar.id,
          platform: 'Community Forum',
          content: 'Pleasant evening rain near Jawahar Circle and Patrika Gate. Weather is much cooler now!',
          sentimentScore: 0.85,
          sentimentLabel: 'POSITIVE',
          keywords: ['patrika-gate', 'pleasant-weather', 'rain'],
        },
        {
          zoneId: mansarovar.id,
          platform: 'Local Ward Group',
          content: 'Jaipur Metro running smoothly on time between Mansarovar and Badi Chaupar despite rains.',
          sentimentScore: 0.70,
          sentimentLabel: 'POSITIVE',
          keywords: ['metro', 'mansarovar', 'transit'],
        },
        {
          zoneId: sitapura.id,
          platform: 'RIICO Helpline',
          content: 'Strong chemical smell and thick dust haze near Sitapura Phase 3. Please check industrial chimney filters.',
          sentimentScore: -0.65,
          sentimentLabel: 'NEGATIVE',
          keywords: ['pollution', 'smell', 'sitapura'],
        },
      ],
    });

    console.log('[Database Seeder] Jaipur Civic Social Sentiments seeded.');

    // 7. Disaster Management Event (Secondary API - Rajasthan Disaster Management Authority)
    await prisma.disaster.create({
      data: {
        zoneId: pinkCity.id,
        title: 'Jaipur Urban Flash Flood & Drainage Surcharge Warning',
        disasterType: 'FLOOD',
        severity: 'HIGH',
        status: 'ACTIVE',
        description: 'Intense cloudburst over Walled City catchment causing stormwater overflow in low-lying heritage bazaars.',
        instructions: 'Avoid entering Sanganeri Gate and Ghat Gate underpasses. JDA emergency dewatering pumps deployed.',
        affectedRadiusKm: 4.5,
        latitude: pinkCity.latitude,
        longitude: pinkCity.longitude,
      },
    });

    console.log('[Database Seeder] Jaipur Disaster Emergency alert seeded.');
    console.log('===========================================================');
    console.log('  Jaipur CityPulse Database Seeding Finished Successfully! ');
    console.log('===========================================================');
  } catch (error) {
    console.error('[Database Seeder] Error seeding Jaipur data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
