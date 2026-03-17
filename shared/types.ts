export enum Role {
  ADMIN = 'ADMIN',
  OPS_MANAGER = 'OPS_MANAGER',
  ANALYST = 'ANALYST',
  FIELD_OPERATOR = 'FIELD_OPERATOR',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface Zone {
  id: string;
  name: string;
  geometry: any; // GeoJSON or string
  cleanlinessScore: number;
}

export enum BinType {
  GENERAL = 'GENERAL',
  RECYCLING = 'RECYCLING',
  COMPOST = 'COMPOST',
  HAZARDOUS = 'HAZARDOUS',
}

export interface Bin {
  id: string;
  zoneId: string;
  lat: number;
  lng: number;
  capacity: number;
  currentFillLevel: number; // 0 to 100
  type: BinType;
  lastCollected?: Date;
}

export interface Vehicle {
  id: string;
  capacity: number; // Max weight or volume
  status: 'IDLE' | 'ON_ROUTE' | 'MAINTENANCE';
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  vehicleId: string;
  waypoints: any; // JSON array of lat/lng pairs or Bin IDs
  estimatedDuration: number; // in minutes
  emissionsSaved: number; // in kg CO2
  createdAt: Date;
}

export interface Alert {
  id: string;
  type: 'OVERFLOW_RISK' | 'SERVICE_GAP' | 'SENSOR_OFFLINE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  resolved: boolean;
}
