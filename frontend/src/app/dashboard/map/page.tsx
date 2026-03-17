'use client';

import { useState } from 'react';
import Map, { NavigationControl, ScaleControl, FullscreenControl, GeolocateControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Layers, 
  Search, 
  MapPin, 
  Truck, 
  Database,
  Info,
  Maximize2,
  Trash2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Mock points for map
const MOCK_ASSETS = [
  { id: 'bin-1', type: 'bin', name: 'Bin C-102', lat: 40.7128, lng: -74.0060, fill: 85, status: 'Warning' },
  { id: 'bin-2', type: 'bin', name: 'Bin C-105', lat: 40.7158, lng: -74.0090, fill: 92, status: 'Critical' },
  { id: 'truck-1', type: 'truck', name: 'Truck V-09', lat: 40.7188, lng: -74.0040, capacity: 60, status: 'On Route' },
  { id: 'depot-1', type: 'depot', name: 'Central Landfill', lat: 40.7258, lng: -74.0150, capacity: 45, status: 'Operating' },
];

export default function CommandMapPage() {
  const [viewState, setViewState] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    zoom: 13
  });

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 relative">
      
      {/* Map Container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-card/50">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          <GeolocateControl position="top-right" />
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl />
        </Map>

        {/* Map Overlays */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <div className="bg-background/80 backdrop-blur-md border border-border rounded-xl p-3 shadow-xl w-64">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Find asset or zone..." 
                className="w-full pl-8 pr-3 py-1.5 bg-card/50 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:border-primary/40 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-md flex items-center gap-1.5 cursor-pointer hover:bg-emerald-500/20">
                <Trash2 className="w-3 h-3" /> Bins
              </span>
              <span className="px-2 py-1 bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-[10px] font-bold rounded-md flex items-center gap-1.5 cursor-pointer hover:bg-teal-500/20">
                <Truck className="w-3 h-3" /> Vehicles
              </span>
              <span className="px-2 py-1 bg-foreground/5 border border-border text-muted-foreground text-[10px] font-bold rounded-md flex items-center gap-1.5 cursor-pointer hover:bg-muted/50">
                <Database className="w-3 h-3" /> Landfills
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 z-10 translate-y-0 opacity-100 transition-all duration-300">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-xl p-4 shadow-2xl flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Clean</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-card/50 border border-border rounded-2xl p-5 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Asset Monitor</h2>
            <Layers className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {MOCK_ASSETS.map((asset) => (
              <div key={asset.id} className="p-3 bg-card border border-border rounded-xl hover:border-primary/30 hover:bg-muted/50 transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {asset.type === 'bin' && <Trash2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
                    {asset.type === 'truck' && <Truck className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />}
                    {asset.type === 'depot' && <Database className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />}
                    <span className="text-xs font-semibold text-foreground">{asset.name}</span>
                  </div>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                    asset.status === 'Critical' ? "bg-red-500/20 text-red-600 dark:text-red-400" :
                    asset.status === 'Warning' ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" :
                    "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  )}>
                    {asset.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{asset.type === 'bin' ? 'Fill Level' : 'Capacity'}</span>
                    <span>{asset.type === 'bin' ? `${asset.fill}%` : `${asset.capacity}%`}</span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-500",
                      (asset.fill ?? 0) > 80 || (asset.capacity ?? 0) > 80 ? "bg-red-500" : 
                      (asset.fill ?? 0) > 60 || (asset.capacity ?? 0) > 60 ? "bg-yellow-500" : "bg-emerald-500"
                    )} style={{ width: `${asset.fill ?? asset.capacity ?? 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Critical Event</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Zone C infrastructure reporting 92% overload risk. 
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 group cursor-pointer hover:bg-primary/10 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Map Intelligence</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Heatmaps & flow prediction active.</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 ml-auto group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
