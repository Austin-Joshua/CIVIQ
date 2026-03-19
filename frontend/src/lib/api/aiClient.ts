const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';

/**
 * Waste Generation Forecast Service
 * https://github.com/UCloudMl/solid-waste-prediction integration
 */
export async function fetchWasteForecast(zoneIds: string[], startDate: string, endDate: string) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone_ids: zoneIds, start_date: startDate, end_date: endDate }),
    });
    return await res.json();
  } catch (error) {
    console.warn("AI Backend unreachable. Using frontend fallback data.", error);
    return null;
  }
}

/**
 * Spatial Hotspot Analysis Service
 * https://github.com/cloudwalk/PyEhsa integration
 */
export async function analyzeHotspots(coordinates: [number, number][], timeWindowHours: number = 24) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/hotspots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geospatial_coordinates: coordinates, time_window_hours: timeWindowHours }),
    });
    return await res.json();
  } catch (error) {
    console.warn("AI Backend unreachable. Using frontend fallback data.", error);
    return null;
  }
}

/**
 * Anomaly Detection Service
 * https://github.com/yzhao062/anomaly-detection-resources integration
 */
export async function detectAnomalies(timeSeriesData: number[], sensorIds: string[]) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/anomalies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ time_series_data: timeSeriesData, sensor_ids: sensorIds }),
    });
    return await res.json();
  } catch (error) {
    console.warn("AI Backend unreachable.", error);
    return null;
  }
}

/**
 * Service Demand Forecasting
 * https://github.com/ramisa2108/Taxi-Demand-Forecasting-System integration
 */
export async function forecastServiceDemand(zoneIds: string[]) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/demand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zone_ids: zoneIds }),
    });
    return await res.json();
  } catch (error) {
    console.warn("AI Backend unreachable.", error);
    return null;
  }
}

/**
 * Waste Classification Service
 * https://github.com/garythung/trashnet integration
 */
export async function classifyWasteImage(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${AI_SERVICE_URL}/api/classify`, {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (error) {
    console.warn("AI Backend unreachable.", error);
    return null;
  }
}

/**
 * Route Optimization Service
 * OR-Tools VRP / Google Maps integration
 */
export async function optimizeRoutes(depot: string, nodes: string[], vehicles: number, capacities: number[]) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/api/optimize-routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depot_location: depot, pickup_nodes: nodes, num_vehicles: vehicles, vehicle_capacities: capacities }),
    });
    return await res.json();
  } catch (error) {
    console.warn("AI Backend unreachable. Using linear pathing fallback.", error);
    return null;
  }
}
