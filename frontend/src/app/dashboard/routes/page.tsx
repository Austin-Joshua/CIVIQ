'use client';

import { useState, useEffect } from 'react';
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

const MOCK_ROUTES = [
  {
    id: 'R-001',
    vehicleId: 'V-09',
    status: 'In Progress',
    stops: 14,
    completedStops: 6,
    duration: '45m remaining',
    emissionsSaved: '4.2kg',
    priority: 'High'
  },
  {
    id: 'R-002',
    vehicleId: 'V-12',
    status: 'Pending',
    stops: 22,
    completedStops: 0,
    duration: '1h 20m est.',
    emissionsSaved: '6.8kg',
    priority: 'Medium'
  },
  {
    id: 'R-003',
    vehicleId: 'V-04',
    status: 'Completed',
    stops: 18,
    completedStops: 18,
    duration: 'Finished',
    emissionsSaved: '5.1kg',
    priority: 'Low'
  }
];

export default function RouteIntelligencePage() {
  const [activeRoute, setActiveRoute] = useState(MOCK_ROUTES[0]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-3">
            <RouteIcon className="w-6 h-6 text-emerald-500 dark:text-emerald-400" /> Route Intelligence
          </h1>
          <p className="text-muted-foreground text-sm">
            Dynamically optimized collection patterns powered by AI VRP solver.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/30">
            <Play className="w-3.5 h-3.5 fill-current" /> Run Optimizer
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
                      <Leaf className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{route.emissionsSaved} saved</span>
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
                  <h2 className="text-lg font-bold text-foreground">Live Route Feed: {activeRoute.id}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" /> Updated 14 seconds ago • Operational Zone C
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none mb-1">Estimated Efficiency</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">96.4%</span>
              </div>
            </div>

            <div className="p-6">
              <div className="relative h-64 w-full bg-background rounded-xl border border-border flex items-center justify-center group overflow-hidden">
                {/* Visual Placeholder for Mini-Map */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center animate-pulse">
                    <MapPin className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest group-hover:text-emerald-500/50 transition-colors">Spatial Feed Loading...</p>
                </div>
                
                {/* Mock Waypoint Path Overlay */}
                <div className="absolute inset-x-12 top-1/2 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0 blur-[1px]" />
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
                      <span className="text-xs text-muted-foreground">Fuel Consumption</span>
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">12.4 L / 100km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Driver Efficiency</span>
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">Optimal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Idle Time Reduction</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+14.2%</span>
                    </div>
                  </div>
                  <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-200/60 leading-relaxed italic">
                      "Optimizer rerouted current vehicle to avoid congestion in North district, saving 12 minutes."
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
