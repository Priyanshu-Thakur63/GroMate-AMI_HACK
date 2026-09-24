# CityPulse Jaipur (Rajasthan) — Modular Backend REST API

A scalable, feature-driven civic health, incident reporting, and disaster management backend built with **Node.js**, **Express**, **PostgreSQL**, and **Prisma ORM (Multi-File Schemas & Code-Based Auto-Migration)**.

---

## 📍 Configured Region: Jaipur, Rajasthan

The system is pre-configured with real geographic coordinates, civic zones, and incident telemetry for **Jaipur, Rajasthan**:
1. **Walled City (Pink City & Johari Bazaar)** — Heritage core (`26.9239° N, 75.8267° E`)
2. **C-Scheme & MI Road Commercial Hub** — Central business district (`26.9124° N, 75.8010° E`)
3. **Malviya Nagar & Jawahar Circle** — South-East residential/commercial (`26.8530° N, 75.8048° E`)
4. **Mansarovar & Metro Corridor** — South-West urban sector (`26.8620° N, 75.7580° E`)
5. **Vaishali Nagar & Queens Road** — West Jaipur urban center (`26.9056° N, 75.7410° E`)
6. **Sitapura Industrial & Institutional Area** — RIICO industrial zone (`26.7725° N, 75.8360° E`)

---

## 🗄️ Database Credentials & Configuration

In `backend/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:123456789@localhost:5432/citypulse_jaipur_db?schema=public"
```

---

## 🏗️ Architecture & File Structure

```
backend/
├── prisma/
│   └── schema/                    # Individual Prisma schema per table
│       ├── schema.prisma          # Datasource & generator config
│       ├── zone.prisma            # Jaipur Zone model (city: Jaipur, state: Rajasthan)
│       ├── weather.prisma         # WeatherData model
│       ├── incident.prisma        # 311 Nagar Nigam IncidentReport model
│       ├── airQuality.prisma      # RSPCB AirQuality model
│       ├── socialSentiment.prisma # SocialSentiment civic feed model
│       ├── disaster.prisma        # Disaster Emergency model (Secondary)
│       └── pulseScore.prisma      # PulseScoreLog composite log model
├── src/
│   ├── config/
│   │   └── database.js            # Prisma client instance
│   ├── database/
│   │   ├── autoMigrate.js         # Code-based auto-migration runner
│   │   └── seed.js                # Jaipur civic test data seeder
│   ├── middleware/
│   │   └── errorHandler.js        # Centralized HTTP error handler
│   ├── features/
│   │   ├── weather/               # Weather API feature
│   │   │   ├── weather.service.js
│   │   │   ├── weather.controller.js
│   │   │   └── weather.routes.js
│   │   ├── incident/              # Nagar Nigam 311 Incidents feature
│   │   │   ├── incident.service.js
│   │   │   ├── incident.controller.js
│   │   │   └── incident.routes.js
│   │   ├── airQuality/            # Air Quality feature
│   │   │   ├── airQuality.service.js
│   │   │   ├── airQuality.controller.js
│   │   │   └── airQuality.routes.js
│   │   ├── socialSentiment/       # Social Sentiment feature
│   │   │   ├── socialSentiment.service.js
│   │   │   ├── socialSentiment.controller.js
│   │   │   └── socialSentiment.routes.js
│   │   ├── disaster/              # Disaster Management feature (Secondary)
│   │   │   ├── disaster.service.js
│   │   │   ├── disaster.controller.js
│   │   │   └── disaster.routes.js
│   │   ├── pulse/                 # Civic Health Pulse & Correlation Engine
│   │   │   ├── pulse.service.js
│   │   │   ├── pulse.controller.js
│   │   │   └── pulse.routes.js
│   │   └── zone/                  # Jaipur Civic Zones feature
│   │       ├── zone.service.js
│   │       ├── zone.controller.js
│   │       └── zone.routes.js
│   ├── app.js                     # Express app setup & route mounts
│   └── server.js                  # Server entrypoint with auto-migration
├── .env
├── .env.example
└── package.json
```

---

## 🚀 Running the Application

1. **Start the Development Server (with Auto-Migration):**
   ```powershell
   npm run dev
   ```
   *The server tests PostgreSQL on startup and automatically pushes any schema changes to the database.*

2. **Seed Jaipur Civic Data:**
   ```powershell
   npm run seed
   ```

---

## 📡 REST API Reference

### **Primary APIs**
- **Weather API (`/api/weather`)**:
  - `GET /api/weather` (Filter: `?zoneId=`, `?limit=`)
  - `GET /api/weather/latest`
  - `GET /api/weather/:id`
  - `POST /api/weather`
- **Incident Report API (`/api/incidents`)**:
  - `GET /api/incidents` (Filter: `category`, `severity`, `status`, `zoneId`)
  - `GET /api/incidents/:id`
  - `POST /api/incidents`
  - `PATCH /api/incidents/:id`
  - `DELETE /api/incidents/:id`
- **Air Quality API (`/api/air-quality`)**:
  - `GET /api/air-quality`
  - `GET /api/air-quality/latest`
  - `POST /api/air-quality`
- **Social Sentiment API (`/api/social-sentiment`)**:
  - `GET /api/social-sentiment`
  - `GET /api/social-sentiment/summary`
  - `POST /api/social-sentiment`

### **Secondary & Fusion APIs**
- **Disaster Management API (`/api/disaster`)**:
  - `GET /api/disaster`
  - `GET /api/disaster/active`
  - `GET /api/disaster/:id`
  - `POST /api/disaster`
  - `PATCH /api/disaster/:id`
- **Civic Health Pulse Engine (`/api/pulse`)**:
  - `GET /api/pulse` (City-wide composite 0–100 score & cross-feed correlation)
  - `GET /api/pulse/zone/:zoneId`
- **Jaipur Civic Zones (`/api/zones`)**:
  - `GET /api/zones`
  - `GET /api/zones/:id`
  - `POST /api/zones`
