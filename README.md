# 🏙️ CityPulse: Intelligent Civic Health & Urban Resilience Engine

[![AmiHacks 2026](https://img.shields.io/badge/AmiHacks-Problem_Statement_2-blue.svg)](https://github.com)
[![React 19](https://img.shields.io/badge/Frontend-React_19_+_Vite-61DAFB.svg)](https://react.dev)
[![Express.js](https://img.shields.io/badge/Backend-Node.js_+_Express-000000.svg)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_+_Prisma_ORM-336791.svg)](https://www.postgresql.org)
[![Leaflet GIS](https://img.shields.io/badge/GIS-Leaflet_+_OpenStreetMap-199900.svg)](https://leafletjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **AmiHacks Hackathon — Problem Statement 2: Urban Governance, Sensor Fusion & Civic Resilience**  
> **Deployment Target:** Jaipur Municipal Corporation (JMC), Rajasthan, India

---

## 📌 1. Project Overview

**CityPulse** is a real-time, multi-feed civic intelligence platform engineered to monitor, analyze, and elevate urban resilience across Jaipur, Rajasthan. 

Urban municipal departments typically operate in isolated silos—the weather bureau tracks rainfall without road context, traffic control monitors jams without drainage visibility, and pollution boards check AQI separately from localized incidents. 

CityPulse unifies **live weather telemetry, atmospheric air pollution, arterial transit speeds, citizen incident reports, news sentiment, and disaster declarations** into a standardized **Common Data Model (CDM)**. Powered by statistical anomaly detection and spatio-temporal correlation engines, CityPulse computes live **Composite Civic Health Scores ($0-100$)** and enables rapid municipal response.

---

## 🏛️ 2. System Architecture

```mermaid
flowchart TD
    %% TIER 1: INGESTION
    subgraph T1["Tier 1: Multi-Feed Live Ingestion Streams"]
        W_API["🌦️ OpenWeather Current API<br/>(Live API Key Stream)"]
        AQ_API["🍃 OpenWeather Pollution API<br/>(PM2.5, PM10, NO2, O3)"]
        OM_API["🌍 Open-Meteo & Copernicus CAMS<br/>(Zero-Key Failover Stream)"]
        GN_API["📰 GNews.io API<br/>(Citizen Sentiment & News)"]
        INC_API["🚨 Municipal 311 Stream<br/>(Citizen Incident Reports)"]
        TRF_API["🚗 Jaipur Arterial GIS Stream<br/>(Corridor Speeds & Delays)"]
    end

    %% TIER 2: ADAPTERS
    subgraph T2["Tier 2: Stateless Normalization Layer (Adapters)"]
        WA["weatherAdapter.js<br/>• WMO numeric code to text<br/>• Wind unit conversion to km/h<br/>• Rainfall severity scaling"]
        AQA["airQualityAdapter.js<br/>• Indian NAQI / EPA scale 0-500<br/>• Particulate PM2.5/PM10 mapping"]
        SNA["sentimentAdapter.js<br/>• Lexicon Tone Engine<br/>• Bounded polarity [-1.0, +1.0]"]
        ICA["incidentAdapter.js<br/>• Category canonicalization<br/>• 1-5 level to Severity Enum"]
        TFA["traffic.service.js<br/>• Free-flow velocity loss calc<br/>• Congestion ratio & delay (+min)"]
    end

    %% TIER 3: DUAL PERSISTENCE DATABASE
    subgraph T3["Tier 3: PostgreSQL Database (Dual Persistence via Prisma ORM)"]
        subgraph CDM_STORE["Unified Common Data Model (CDM)"]
            TBL_OBS["📋 CivicObservation Table<br/>(Flat Time-Series: category, value, severity, lat, lon, observedAt)"]
            TBL_ANOM["⚠️ AnomalyLog Table<br/>(Statistical Outliers with Z-Scores)"]
            TBL_CORR["🔗 CorrelationLog Table<br/>(Multi-Feed Co-Occurrences)"]
        end
        subgraph DOMAIN_STORE["Specialized Domain Snapshots"]
            TBL_ZN["📍 Zone Model (Jaipur Wards)"]
            TBL_WD["🌦️ WeatherData Model"]
            TBL_AQD["🍃 AirQuality Model"]
            TBL_INCD["🚨 IncidentReport Model"]
            TBL_SENT["💬 SocialSentiment Model"]
        end
    end

    %% TIER 4: ANALYTICS ENGINES
    subgraph T4["Tier 4: Analytics & Intelligence Engines"]
        ENG_PULSE["⚡ Composite Pulse Engine<br/>OverallScore = 0.35 Infra + 0.25 Env + 0.25 Disaster + 0.15 Sentiment"]
        ENG_ANOM["📈 Z-Score Anomaly Detector<br/>Z = (Value - RollingMean) / RollingStdDev (Z > 2.5)"]
        ENG_CORR["🧠 Spatio-Temporal Correlation Engine<br/>Evaluates 15-min co-occurrences in identical zoneId"]
    end

    %% TIER 5: REST API
    subgraph T5["Tier 5: Express.js REST API Layer (Port 5000)"]
        EP1["GET /api/pulse"]
        EP2["GET /api/traffic"]
        EP3["GET /api/incidents"]
        EP4["GET /api/weather/latest"]
        EP5["GET /api/anomalies"]
        EP6["GET /api/correlations"]
        EP7["POST /api/ingest/sync"]
        EP8["GET /health"]
    end

    %% TIER 6: FRONTEND UI
    subgraph T6["Tier 6: React + Vite Frontend Command Deck"]
        subgraph GIS_MAP["Interactive GIS Leaflet Canvas"]
            CORR_LINES["🚗 Jaipur Arterial Polylines<br/>(Tonk Rd, MI Rd, JLN Marg, Ajmer Rd, Gopalpura, Walled City)"]
            PULSE_PINS["📍 Dynamic HTML Pins<br/>(Pulsating Alert Halos & Metric Readouts)"]
        end
        subgraph ADAPTIVE_DRAWER["Domain-Adaptive Presentation Suites"]
            SUITE_PULSE["⚡ Resilience Radar (4-Pillar Bars)"]
            SUITE_WTH["🌧️ Weather Studio (Feels-like & Meteogram)"]
            SUITE_AQ["🍃 AQI Spectrum (Continuous EPA 0-500 Bar)"]
            SUITE_TRF["🚗 Velocity Telemetry (Delay & Congestion Ratios)"]
            SUITE_INC["⚠️ Emergency Triage (Priority Queue & Field Dispatch)"]
        end
    end

    %% CONNECTORS
    W_API & OM_API --> WA
    AQ_API & OM_API --> AQA
    GN_API --> SNA
    INC_API --> ICA
    TRF_API --> TFA

    WA & AQA & SNA & ICA & TFA --> TBL_OBS
    WA --> TBL_WD
    AQA --> TBL_AQD
    SNA --> TBL_SENT
    ICA --> TBL_INCD

    TBL_OBS --> ENG_ANOM & ENG_CORR
    TBL_WD & TBL_AQD & TBL_INCD & TBL_SENT & TBL_ZN --> ENG_PULSE

    ENG_ANOM --> TBL_ANOM
    ENG_CORR --> TBL_CORR

    ENG_PULSE --> EP1
    TFA --> EP2
    TBL_INCD --> EP3
    TBL_WD --> EP4
    TBL_ANOM --> EP5
    TBL_CORR --> EP6
    TBL_OBS --> EP7

    EP1 & EP2 & EP3 & EP4 --> GIS_MAP
    EP1 & EP2 & EP3 & EP4 & EP5 & EP6 --> ADAPTIVE_DRAWER
```

---

## 🔀 3. Normalization Pipeline & Common Data Model (CDM)

Heterogeneous external payloads are transformed into a single unified time-series schema in PostgreSQL:

```mermaid
flowchart LR
    subgraph RAW["Incoming Raw Telemetry"]
        R1["WMO Code 65, 22 mm/h, 4.2 m/s"]
        R2["PM2.5: 85 µg/m³, PM10: 160 µg/m³"]
        R3["'Underpass submerged', Severity: 4"]
        R4["'Traffic chaos at Panch Batti'"]
    end

    subgraph ADAPTERS["Adapters & Transformation"]
        A1["weatherAdapter.js<br/>• Unit to km/h<br/>• Condition: 'Heavy Rain'<br/>• Severity: 'CRITICAL'"]
        A2["airQualityAdapter.js<br/>• Indian NAQI Formula<br/>• Score: 183 AQI<br/>• Category: 'UNHEALTHY'"]
        A3["incidentAdapter.js<br/>• Category: 'WATERLOGGING'<br/>• Severity: 'HIGH'"]
        A4["sentimentAdapter.js<br/>• Lexicon Tone Engine<br/>• Tone Score: -0.70 (Distress)"]
    end

    subgraph UNIFIED_CDM["Normalized CivicObservation"]
        U1["Observation(category='WEATHER', metric='RAINFALL', value=22.0, severity='CRITICAL')"]
        U2["Observation(category='AIR_QUALITY', metric='AQI', value=183.0, severity='ELEVATED')"]
        U3["Observation(category='INCIDENT', metric='WATERLOGGING', value=4.0, severity='CRITICAL')"]
        U4["Observation(category='SENTIMENT', metric='PUBLIC_TONE', value=-0.70, severity='CRITICAL')"]
    end

    R1 --> A1 --> U1
    R2 --> A2 --> U2
    R3 --> A3 --> U3
    R4 --> A4 --> U4
```

---

## 🔢 4. Mathematical & Analytical Formulations

### A. Composite Civic Pulse Score Formula
The health of each zone is evaluated via a weighted 4-pillar formulation:

$$\text{OverallScore} = 0.35 \times \text{InfraScore} + 0.25 \times \text{EnvScore} + 0.25 \times \text{DisasterScore} + 0.15 \times \text{SentimentScore}$$

- **Environmental Pillar ($25\%$)**: Penalizes heavy precipitation ($>20\text{ mm} \implies -15$), wind storms ($>60\text{ km/h} \implies -20$), and hazardous AQI ($>200\text{ AQI} \implies -25$).
- **Infrastructure Pillar ($35\%$)**: Penalizes open unresolved incidents based on severity: $\text{Critical} (-25)$, $\text{High} (-15)$, $\text{Medium} (-8)$, $\text{Low} (-3)$.
- **Disaster Preparedness ($25\%$)**: Evaluates active flash flood and meteorological alerts ($-50$).
- **Citizen Sentiment ($15\%$)**: Rolling average public sentiment $[-1.0, +1.0]$ mapped linearly to $[0, 100]$.

### B. Statistical Z-Score Anomaly Outlier Detection
Evaluates metrics against a 24-hour rolling mean ($\mu$) and standard deviation ($\sigma$):

$$Z = \frac{x - \mu}{\sigma}$$

- **Threshold**: Observations with **$Z > 2.5$** are logged to `AnomalyLog` without distorting historical baseline calculations.

---

## ⏱️ 5. Real-Time Ingestion to Operator Action Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Sensor as 🌦️ Weather/AQ Sensor / Citizen
    participant Ingest as ⚙️ Ingestion & Adapters
    participant DB as 🐘 PostgreSQL (Prisma CDM)
    participant Analytics as 🧠 Analytics & Pulse Engine
    participant API as 🌐 Express REST API
    participant UI as 🖥️ Leaflet GIS & React Deck
    actor Operator as 👤 Municipal Officer

    Sensor->>Ingest: Stream Raw Telemetry (Precipitation > 20mm, Temp, Incidents)
    Ingest->>Ingest: Normalize units, classify severity, clamp tone score
    Ingest->>DB: Write CivicObservation & Domain Snapshot (Dual Persistence)
    
    par Statistical & Correlation Pipeline
        DB->>Analytics: Query 15-min rolling window for zoneId
        Analytics->>Analytics: Detect Multi-Anomaly (Rain + Waterlogging)
        Analytics->>Analytics: Compute Composite Pulse Score (0-100)
        Analytics->>DB: Save AnomalyLog & CorrelationLog
    end

    UI->>API: GET /api/pulse & GET /api/traffic
    API->>DB: Query synchronized zone states & corridors
    DB-->>API: Return composite scores, corridor delays, active hazards
    API-->>UI: Deliver JSON Payload

    UI->>UI: Render Glowing Red Corridor on MI Road + Pulsating Alert Halo
    UI->>UI: Display Storm Drainage Collapse Banner in Side Drawer

    Operator->>UI: Click "Dispatch Field Unit" or "Broadcast Advisory"
    UI->>API: POST /api/ingest/incident (Assign Rapid Response Unit 04)
    API->>DB: Update incident status to DISPATCHED
    UI-->>Operator: Display Confirmation Toast Notification
```

---

## 🌐 6. Master REST API Catalog

| Method | Route Endpoint | Query / Body Params | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/health` | *None* | Health diagnostics & uptime verification |
| **`GET`** | `/api/pulse` | *None* | Zone pulse scores, 4-pillar sub-scores, status labels |
| **`GET`** | `/api/traffic` | *None* | Jaipur arterial road speeds, delays, and congestion % |
| **`GET`** | `/api/incidents` | `?limit=20`, `?status=OPEN` | Active municipal incidents with severity classification |
| **`GET`** | `/api/weather/latest` | *None* (or `?zoneId=...`) | Real-time temperature, rainfall ($\text{mm}$), and wind vector |
| **`GET`** | `/api/summary` | *None* | City-wide aggregated KPI metrics |
| **`GET`** | `/api/anomalies` | *None* | Statistical Z-score outlier alerts ($Z > 2.5$) |
| **`GET`** | `/api/correlations` | *None* | Spatio-temporal multi-feed correlation logs |
| **`POST`** | `/api/ingest/sync` | *None* | Instant out-of-band multi-feed sync trigger |
| **`POST`** | `/api/ingest/incident` | `{ title, category, severity, lat, lon, zoneId }` | Ingests a new citizen incident into CDM |

---

## 🚀 7. Local Setup & Quick Start

### Prerequisites
- **Node.js** v18.0 or higher
- **PostgreSQL** active on port `5432`
- **npm** package manager

### 1. Clone & Configure Environment
```bash
# Clone the repository
git clone https://github.com/your-org/GroMate-AMI_HACK.git
cd GroMate-AMI_HACK

# Configure Backend .env (backend/.env)
DATABASE_URL="postgresql://postgres:123456789@localhost:5432/ami_hacks_gromate?schema=public"
PORT=5000
NODE_ENV=development
OPENWEATHER_API_KEY="your_openweather_api_key_here"
```

### 2. Start Backend Server
```bash
cd backend
npm install
node src/server.js
# Backend will automatically verify DB connection, auto-migrate Prisma schema,
# seed Jaipur municipal zones, and start listening on http://localhost:5000
```

### 3. Start Frontend Dashboard
```bash
cd ../frontend
npm install
npm run dev
# Frontend will be live on http://localhost:5173
```

---

## 📁 8. Project Directory Structure

```
GroMate-AMI_HACK/
├── backend/
│   ├── prisma/schema/              # Multi-file Prisma schema
│   │   ├── zone.prisma             # Municipal zones & GIS coordinates
│   │   ├── weather.prisma          # Meteorological records
│   │   ├── airQuality.prisma       # Particulate & gas concentrations
│   │   ├── incident.prisma         # 311 incident reports
│   │   ├── traffic.prisma          # Corridor speeds & delays
│   │   ├── socialSentiment.prisma  # Public tone & distress lexicon
│   │   ├── disaster.prisma         # Disaster declarations
│   │   └── observation.prisma      # Unified CDM & Anomaly logs
│   ├── src/
│   │   ├── adapters/               # Stateless Normalization Layer
│   │   │   ├── weatherAdapter.js
│   │   │   ├── airQualityAdapter.js
│   │   │   ├── incidentAdapter.js
│   │   │   └── sentimentAdapter.js
│   │   ├── analytics/              # Statistical Intelligence
│   │   │   ├── anomaly.service.js   # Rolling Z-score anomaly detector
│   │   │   └── correlation.service.js # Spatio-temporal event correlator
│   │   ├── features/               # Feature-based REST Controllers & Services
│   │   │   ├── pulse/              # Composite civic score engine
│   │   │   ├── traffic/            # Arterial road telemetry
│   │   │   ├── ingestion/          # Live API orchestrator
│   │   │   └── weather/airQuality/incident/zone/
│   │   └── server.js               # Auto port manager & 10-min background sync
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LiveMap.jsx         # Leaflet GIS canvas & adaptive drawer
    │   │   ├── StatCard.jsx        # Top-level city KPI metrics
    │   │   ├── RecentAlerts.jsx    # Priority incident list
    │   │   ├── TrendChart.jsx      # 24-hr hourly rainfall vs. traffic
    │   │   ├── AIInsights.jsx      # Multi-source AI correlation cards
    │   │   └── Sidebar.jsx         # City Pulse radial gauge & live weather
    │   ├── pages/                  # Dashboard, AIInsights, Events, Reports
    │   └── services/api.js         # Frontend REST client with SWR fallback
```

---

## 🏆 9. Core Strengths & Innovation Matrix

| Feature | CityPulse Implementation | Traditional Civic Dashboards |
| :--- | :--- | :--- |
| **Multi-Source Data Fusion** | Unified Common Data Model across 5 heterogeneous streams | Siloed individual dashboards with separate logins |
| **Predictive Intelligence** | Statistical Z-score anomaly detection & spatio-temporal correlation | Static threshold alerts without root-cause correlation |
| **GIS Representation** | Jaipur arterial road networks with live speed & delay polylines | Static pin drops or watermarked paid tile layers |
| **Zero-Downtime Reliability** | Dual-provider failover (OpenWeather $\to$ Open-Meteo) | System crashes upon API rate limiting |
| **Actionable Operations** | One-click field dispatch & citizen advisory broadcasting | Read-only graphs with no actionable dispatch |

---

*Engineered with ❤️ for AmiHacks 2026 by Team GroMate.*