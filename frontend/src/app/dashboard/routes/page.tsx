'use client';

import { useState, useEffect } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { 
  Route as RouteIcon, 
  Clock, 
  MapPin, 
  Truck, 
  Leaf, 
  ArrowRight, 
  ChevronRight,
  Play,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/Cards';
import { MissingKeyOverlay } from '@/components/ui/Maps';

const MOCK_ROUTES = [
  {
    id: 'R-001',
    vehicleId: 'V-09',
    status: 'In Progress',
    stops: 14,
    completedStops: 6,
    duration: '45m remaining',
    impact: '4.2kg',
    priority: 'High',
    origin: { lat: 40.710, lng: -74.008 },
    destination: { lat: 40.725, lng: -74.001 },
  },
  {
    id: 'R-002',
    vehicleId: 'V-12',
    status: 'Pending',
    stops: 22,
    completedStops: 0,
    duration: '1h 20m est.',
    impact: '6.8kg',
    priority: 'Medium',
    origin: { lat: 40.715, lng: -74.015 },
    destination: { lat: 40.730, lng: -73.995 },
  },
  {
    id: 'R-003',
    vehicleId: 'V-04',
    status: 'Completed',
    stops: 18,
    completedStops: 18,
    duration: 'Finished',
    impact: '5.1kg',
    priority: 'Low',
    origin: { lat: 40.705, lng: -74.010 },
    destination: { lat: 40.715, lng: -73.990 },
  }
];

function Directions({ activeRoute }: { activeRoute: typeof MOCK_ROUTES[0] }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    const timer = setTimeout(() => {
      setDirectionsService(new routesLibrary.DirectionsService());
      setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
    }, 0);
    return () => clearTimeout(timer);
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !activeRoute) return;

    directionsService.route({
      origin: activeRoute.origin,
      destination: activeRoute.destination,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
    }).then(response => {
      directionsRenderer.setDirections(response);
    });

  }, [directionsService, directionsRenderer, activeRoute]);

  return null;
}

export default function RouteIntelligencePage() {
  const [activeRoute, setActiveRoute] = useState(MOCK_ROUTES[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <RouteIcon className="w-8 h-8 text-emerald-500" /> Routes
          </h1>
          <p className="text-muted-foreground text-sm">
            Dynamically optimized collection patterns powered by AI VRP solver.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-emerald-900/30 uppercase tracking-widest">
            <Play className="w-3.5 h-3.5 fill-current" /> Optimize
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route List */}
        <div className="lg:col-span-1 space-y-4">
          <SectionHeader title="Active & Scheduled" subtitle="Dispatcher control for vehicle fleet" />
          <div className="space-y-3">
            {MOCK_ROUTES.map((route) => (
              <div 
                key={route.id}
                onClick={() => setActiveRoute(route)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer group",
                  activeRoute.id === route.id 
                    ? "bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20" 
                    : "bg-card border-border hover:bg-muted/50 hover:border-primary/20"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">{route.id}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                      route.status === 'In Progress' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                      route.status === 'Pending' ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" :
                      "bg-foreground/10 text-muted-foreground"
                    )}>
                      {route.status}
                    </span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    activeRoute.id === route.id ? "text-emerald-500 dark:text-emerald-400 translate-x-1" : "text-muted-foreground/50"
                  )} />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Vehicle {route.vehicleId}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{route.stops} optimized waypoints</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider mb-0.5">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${(route.completedStops / route.stops) * 100}%` }} 
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{route.completedStops}/{route.stops}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider mb-0.5">Impact</p>
                    <div className="flex items-center gap-1.5">
                      <Leaf className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{route.impact} saved</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Route Details / Map Preview Mock */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card/50 border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between bg-card/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <RouteIcon className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tighter">Live Feed: {activeRoute.id}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5 font-medium">
                    <Clock className="w-3 h-3" /> Updated 14s ago • Zone C
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Optimization</span>
                <span className="text-2xl font-black text-emerald-500 tracking-tighter">96.4%</span>
              </div>
            </div>

            <div className="p-6">
              <div className="relative h-64 w-full bg-background rounded-xl border border-border flex items-center justify-center group overflow-hidden">
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
                    <Map
                      mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'DEMO_MAP_ID'}
                      defaultCenter={{ lat: 40.715, lng: -74.005 }}
                      defaultZoom={13}
                      gestureHandling={'greedy'}
                      disableDefaultUI={true}
                      className="w-full h-full"
                    >
                      <Directions activeRoute={activeRoute} />
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="absolute inset-0 bg-[#0f172a] flex items-center justify-center">
                    <div className="text-center space-y-3 opacity-30">
                      <RouteIcon className="w-12 h-12 mx-auto text-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Logistics Engine Active (Demo)</p>
                    </div>
                    {/* Mock route line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none">
                      <path 
                        d="M 100 200 Q 300 100 500 200 T 700 150" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        fill="none" 
                        strokeDasharray="8 4"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest pl-1 border-l-2 border-emerald-500/40">Next Sequence</h3>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-card border border-border rounded-xl group hover:bg-muted/50 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          #{activeRoute.completedStops + i}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground/90">Bin C-{100 + i + 10 * i}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">92% fill • Priority Pickup</p>
                        </div>
                        <button className="p-2 rounded-lg text-muted-foreground/50 hover:text-emerald-500 transition-colors">
                          <MapPin className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest pl-1 border-l-2 border-teal-500/40">Resource Metrics</h3>
                  <div className="bg-teal-500/[0.03] border border-teal-500/10 rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Fuel Consumption</span>
                      <span className="text-sm font-black text-teal-500">12.4 L / 100km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Driver Score</span>
                      <span className="text-sm font-black text-teal-500">Optimal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium">Idle Reduction</span>
                      <span className="text-sm font-black text-emerald-500">+14.2%</span>
                    </div>
                  </div>
                  <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-200/60 leading-relaxed italic">
                      &quot;Optimizer rerouted current vehicle to avoid congestion in North district, saving 12 minutes.&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
