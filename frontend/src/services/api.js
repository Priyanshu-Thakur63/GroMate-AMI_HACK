/**
 * CityPulse API Client & Live Sync Service
 * Connects frontend to Express REST backend on http://localhost:5000
 * Falls back gracefully to local dataset when backend is initializing.
 */

import { cityData, citySummary, hourlyTrend, eventFeed } from '../data/cityData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiService = {
  async fetchLivePulse() {
    try {
      const res = await fetch(`${API_BASE_URL}/pulse`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: null };
    }
  },

  async fetchSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/summary`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: null };
    }
  },

  async fetchAnomalies() {
    try {
      const res = await fetch(`${API_BASE_URL}/anomalies`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: [] };
    }
  },

  async fetchCorrelations() {
    try {
      const res = await fetch(`${API_BASE_URL}/correlations`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: [] };
    }
  },

  async fetchIncidents() {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents?limit=20`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: [] };
    }
  },

  async fetchWeather() {
    try {
      const res = await fetch(`${API_BASE_URL}/weather/latest`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: [] };
    }
  },

  async fetchTraffic() {
    try {
      const res = await fetch(`${API_BASE_URL}/traffic`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      return { success: true, data: data.data };
    } catch {
      return { success: false, data: null };
    }
  },

  async triggerSync() {
    try {
      const res = await fetch(`${API_BASE_URL}/ingest/sync`, { method: 'POST' });
      return await res.json();
    } catch (err) {
      console.warn('Sync trigger error:', err);
      return { success: false, error: err.message };
    }
  },

  async createIncident(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/ingest/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err) {
      console.warn('Incident submission error:', err);
      return { success: false, error: err.message };
    }
  },
};
