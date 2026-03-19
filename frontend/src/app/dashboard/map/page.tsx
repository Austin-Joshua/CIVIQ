'use client';

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { 
  Layers, 
  Search, 
  Truck, 
  Database,
  Info,
  Trash2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MissingKeyOverlay } from '@/components/ui/Maps';
import { useUIStore } from '@/store/uiStore';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID';

const MOCK_ASSETS = [
  { id: 'bin-1', type: 'bin', name: 'Bin C-102', lat: 40.7128, lng: -74.0060, fill: 85, status: 'Warning' },
  { id: 'bin-2', type: 'bin', name: 'Bin C-105', lat: 40.7158, lng: -74.0090, fill: 92, status: 'Critical' },
  { id: 'truck-1', type: 'truck', name: 'Truck V-09', lat: 40.7188, lng: -74.0040, capacity: 60, status: 'On Route' },
  { id: 'depot-1', type: 'depot', name: 'Central Landfill', lat: 40.7258, lng: -74.0150, capacity: 45, status: 'Active' },
  { id: 'bin-3', type: 'bin', name: 'Bin D-402', lat: 40.7100, lng: -73.9980, fill: 45, status: 'Stable' },
  { id: 'truck-2', type: 'truck', name: 'Truck V-12', lat: 40.7050, lng: -74.0120, capacity: 20, status: 'Active' },
];

export default function CommandMapPage() {
  const { openReport } = useUIStore();
  const [isDemoMode, setIsDemoMode] = useState(!GOOGLE_MAPS_API_KEY);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [viewState] = useState({
    center: { lat: 40.715, lng: -74.005 },
    zoom: 14
  });
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  useEffect(() => {
    const handleDemo = () => setIsDemoMode(true);
    window.addEventListener('map-demo-mode', handleDemo);
    return () => window.removeEventListener('map-demo-mode', handleDemo);
  }, []);

  const filteredAssets = useMemo(() => {
    return MOCK_ASSETS.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter ? asset.type === activeFilter : true;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, activeFilter]);

  const showMap = GOOGLE_MAPS_API_KEY || isDemoMode;

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 relative font-outfit">
      
      {/* Mobile View Toggle */}
      <div className="lg:hidden flex p-1 bg-card/80 backdrop-blur-xl border border-border rounded-2xl mb-2 shadow-lg w-fit self-center">
        <button 
          onClick={() => setMobileView('map')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            mobileView === 'map' ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Dynamic Map
        </button>
        <button 
          onClick={() => setMobileView('list')}
          className={cn(
            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            mobileView === 'list' ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Asset Monitor
        </button>
      </div>

      {/* Map Container */}
      <div className={cn(
        "flex-1 relative rounded-3xl overflow-hidden border border-border shadow-2xl bg-slate-900 group",
        mobileView === 'list' && "hidden lg:block"
      )}>
        {showMap ? (
          <div className="absolute inset-0">
             {GOOGLE_MAPS_API_KEY ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <Map
                    mapId={MAP_ID}
                    defaultCenter={viewState.center}
                    defaultZoom={viewState.zoom}
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    className="w-full h-full"
                  >
                    {filteredAssets.map((asset) => (
                      <AdvancedMarker 
                        key={asset.id} 
                        position={{ lat: asset.lat, lng: asset.lng }}
                      >
                         <div className={cn(
                          "w-10 h-10 flex items-center justify-center rounded-2xl bg-card border border-white/20 shadow-2xl hover:scale-110 transition-transform cursor-pointer group/marker",
                          asset.status === 'Critical' ? "border-red-500/50 shadow-red-500/20" :
                          asset.status === 'Warning' ? "border-yellow-500/50 shadow-yellow-500/20" :
                          "border-emerald-500/50 shadow-emerald-500/20"
                        )}>
                           <div className={cn(
                             "w-1.5 h-1.5 rounded-full absolute -top-1 -right-1 animate-pulse",
                             asset.status === 'Critical' ? "bg-red-500" :
                             asset.status === 'Warning' ? "bg-yellow-500" : "bg-emerald-500"
                           )} />
                           {asset.type === 'bin' && <Trash2 className="w-4 h-4 text-emerald-500" />}
                           {asset.type === 'truck' && <Truck className="w-4 h-4 text-teal-400" />}
                           {asset.type === 'depot' && <Database className="w-4 h-4 text-blue-400" />}
                        </div>
                      </AdvancedMarker>
                    ))}
                  </Map>
                </APIProvider>
             ) : (
                 <div className="absolute inset-0 bg-[#020617] flex items-center justify-center">
                   <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
                      <div className="relative inline-block">
                         <Layers className="w-16 h-16 mx-auto text-emerald-500/40 animate-pulse" />
                         <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500/60">Sim Engine Active</p>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                            Spatial Intelligence Layer <span className="text-emerald-500/30">|</span> Local Simulation
                         </p>
                      </div>
                   </div>
                   
                   {/* Digital Topography Grid */}
                   <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                   <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
                   
                   {/* Simplified Demo Markers with premium glow */}
                   <div className="absolute inset-0">
                      {filteredAssets.map((asset, i) => (
                        <div 
                          key={asset.id}
                          className="absolute group/sim transition-transform hover:scale-125 duration-300"
                          style={{ 
                            left: `${(asset.lng + 74.02) * 2000}%`, 
                            top: `${(40.73 - asset.lat) * 2000}%` 
                          }}
                        >
                           <div className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl relative">
                              <div className={cn(
                                "absolute inset-0 rounded-xl blur-sm opacity-20",
                                asset.type === 'bin' ? "bg-emerald-500" :
                                asset.type === 'truck' ? "bg-teal-500" : "bg-blue-500"
                              )} />
                              {asset.type === 'bin' && <Trash2 className="w-4 h-4 text-emerald-500" />}
                              {asset.type === 'truck' && <Truck className="w-4 h-4 text-teal-400" />}
                              {asset.type === 'depot' && <Database className="w-4 h-4 text-blue-400" />}
                           </div>
                           {/* Pulse ring */}
                           <div className="absolute inset-0 -m-1 rounded-2xl border border-emerald-500/10 animate-ping opacity-0 group-hover/sim:opacity-100 duration-1000" />
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        ) : (
          <MissingKeyOverlay feature="Command Map" />
        )}

        {/* Floating Controls */}
        <div className="absolute top-6 left-6 z-10 space-y-3">
          <div className="liquid-glass-panel border-white/10 rounded-2xl p-4 shadow-2xl w-72">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search assets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background/50 border border-white/5 rounded-xl text-xs text-foreground focus:outline-none focus:border-emerald-400/30 transition-all placeholder:text-slate-500"
              />
            </div>
            
            <div className="mb-3">
               <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Asset Filters</span>
               <div className="flex flex-wrap gap-2">
                 {[
                   { id: 'bin', label: 'Bins', icon: Trash2, color: 'emerald' },
                   { id: 'truck', label: 'Fleet', icon: Truck, color: 'teal' },
                   { id: 'depot', label: 'Sites', icon: Database, color: 'blue' }
                 ].map((f) => (
                   <button
                     key={f.id}
                     onClick={() => setActiveFilter(activeFilter === f.id ? null : f.id)}
                     className={cn(
                       "px-3 py-1.5 border rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all",
                       activeFilter === f.id 
                         ? `bg-${f.color}-500/20 border-${f.color}-500/50 text-${f.color}-400 shadow-lg shadow-${f.color}-900/20` 
                         : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                     )}
                   >
                     <f.icon className="w-3 h-3" /> {f.label}
                   </button>
                 ))}
               </div>
            </div>

            <div className="pt-3 border-t border-white/5">
               <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Overlay Controls</span>
               <div className="grid grid-cols-2 gap-2">
                  <button className="px-3 py-2 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-between group transition-all hover:bg-emerald-500/20">
                     <span>Heatmap</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>
                  <button className="px-3 py-2 border border-white/5 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-between transition-all hover:bg-white/10">
                     <span>Traffic</span>
                  </button>
                  <button className="px-3 py-2 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-between group transition-all hover:bg-emerald-500/20">
                     <span>Routes</span>
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </button>
                  <button className="px-3 py-2 border border-white/5 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-between transition-all hover:bg-white/10">
                     <span>Zones</span>
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Map Status Legend */}
        <div className="absolute bottom-6 left-6 z-10 translate-y-0 opacity-100 transition-all duration-300">
           <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4 px-3 py-1">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Healthy</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Alert</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Risk</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Asset List Sidebar */}
      <div className={cn(
        "w-full lg:w-[380px] flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500",
        mobileView === 'map' && "hidden lg:flex"
      )}>
        <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-6 flex-1 overflow-hidden flex flex-col shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h2 className="text-xl font-black text-foreground tracking-tighter">Asset Monitor</h2>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">District Urban-I Live Sync</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
               <Layers className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {filteredAssets.map((asset) => (
              <div 
                key={asset.id} 
                onClick={() => openReport(asset.status === 'Critical' || asset.status === 'Warning' ? 'alert' : 'stat', { 
                  type: asset.name, 
                  severity: asset.status.toUpperCase(), 
                  message: `${asset.type.toUpperCase()} point monitoring active. Current status: ${asset.status}.`, 
                  time: 'Live Update',
                  label: asset.name,
                  value: asset.fill || asset.capacity,
                  unit: '%'
                })}
                className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-slate-800/80 transition-all group cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                      asset.type === 'bin' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" :
                      asset.type === 'truck' ? "bg-teal-500/5 border-teal-500/20 text-teal-400" :
                      "bg-blue-500/5 border-blue-500/20 text-blue-400"
                    )}>
                       {asset.type === 'bin' && <Trash2 className="w-5 h-5" />}
                       {asset.type === 'truck' && <Truck className="w-5 h-5" />}
                       {asset.type === 'depot' && <Database className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-sm font-black text-foreground block">{asset.name}</span>
                      <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">{asset.type} Point</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest border",
                    asset.status === 'Critical' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    asset.status === 'Warning' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  )}>
                    {asset.status}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                    <span>{asset.type === 'bin' ? 'Current Volume' : 'Payload Capacity'}</span>
                    <span className="text-foreground">{asset.type === 'bin' ? `${asset.fill}%` : `${asset.capacity}%`}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5">
                    <div className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      (asset.fill ?? 0) > 80 || (asset.capacity ?? 0) > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                      (asset.fill ?? 0) > 60 || (asset.capacity ?? 0) > 60 ? "bg-yellow-500" : "bg-emerald-600"
                    )} style={{ width: `${asset.fill ?? asset.capacity ?? 0}%` }} />
                  </div>
                </div>
              </div>
            ))}
            {filteredAssets.length === 0 && (
              <div className="py-20 text-center opacity-40">
                 <Search className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                 <p className="text-xs font-black uppercase tracking-widest">No assets hidden</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Zone C Threat</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  Infra reporting 92% overload. Redirecting Fleet V-09 to alleviate pressure.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button className="bg-emerald-600/10 border border-emerald-500/20 rounded-3xl p-6 group transition-all hover:bg-emerald-600/20 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-900/40 group-hover:scale-110 transition-transform">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-black text-foreground uppercase tracking-tight">Active Heatmap</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Regional flow prediction enabled</p>
            </div>
            <ChevronRight className="w-5 h-5 text-emerald-500/50 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
