'use client';

import { useState } from 'react';
import { 
  Activity, 
  Settings, 
  Play, 
  RotateCcw, 
  TrendingDown, 
  TrendingUp,
  Leaf,
  DollarSign,
  Truck,
  ShieldAlert,
  Save
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { SectionHeader, StatCard } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { toast } from 'sonner';

// Base prediction model data
const YEARS = ['2024', '2025', '2026', '2027', '2028'];

const generateData = (fleet: number, budget: number, recyclingTarget: number) => {
  return YEARS.map((year, i) => {
    // Mock simulation logic
    const baseEmissions = 12000 - (i * 500);
    const emissionsDelta = (recyclingTarget - 30) * 100 + (fleet - 100) * 50;
    
    const baseCost = 5000000 + (i * 200000);
    const costDelta = (budget - 5000000) * 0.1 * i + (fleet - 100) * 50000;
    
    return {
      year,
      emissions: Math.max(0, baseEmissions - emissionsDelta),
      cost: Math.max(0, baseCost + costDelta),
      baselineEmissions: baseEmissions,
      baselineCost: baseCost,
    };
  });
};

export default function SimulatorPage() {
  const [fleetSize, setFleetSize] = useState(120);
  const [budget, setBudget] = useState(5500000);
  const [recyclingTarget, setRecyclingTarget] = useState(45);
  const [dynamicRouting, setDynamicRouting] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [data, setData] = useState(generateData(120, 5500000, 45));

  const runSimulation = () => {
    setIsSimulating(true);
    toast.info('Initializing AI scenario compilation...');
    setTimeout(() => {
      setData(generateData(fleetSize, budget, recyclingTarget));
      setIsSimulating(false);
      toast.success('Simulation complete. Projected outcomes updated.');
    }, 1500);
  };

  const resetDefaults = () => {
    setFleetSize(120);
    setBudget(5500000);
    setRecyclingTarget(45);
    setDynamicRouting(true);
    setData(generateData(120, 5500000, 45));
    toast.success('Simulation parameters reset to current baseline.');
  };

  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <Activity className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" /> Decision Simulator
          </h1>
          <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-widest pl-11">
            Predictive &quot;What-If&quot; sandbox for strategic urban planning.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={resetDefaults}
            className="flex items-center gap-2 px-4 py-2 liquid-glass transition-colors border-white/10 rounded-xl text-[10px] font-black tracking-widest uppercase text-muted-foreground hover:text-foreground shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button 
            onClick={() => toast.success('Scenario saved to strategic planning repository.')}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl text-[10px] font-black tracking-widest uppercase text-white shadow-xl shadow-emerald-500/20"
          >
            <Save className="w-3.5 h-3.5" /> Save Scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="liquid-glass-panel border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
            <SectionHeader title="Simulation Parameters" subtitle="Adjust variables to forecast multi-year impact" />
            
            <div className="mt-8 space-y-8 relative z-10 flex-1">
              {/* Parameter 1 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-500" /> Active Fleet Size
                  </label>
                  <span className="text-lg font-black text-emerald-500">{fleetSize} units</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="250" 
                  value={fleetSize} 
                  onChange={(e) => setFleetSize(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-500 shadow-inner"
                />
              </div>

              {/* Parameter 2 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-yellow-500" /> OPEX Budget
                  </label>
                  <span className="text-lg font-black text-yellow-500">${(budget / 1000000).toFixed(1)}M</span>
                </div>
                <input 
                  type="range" 
                  min="3000000" max="10000000" step="100000"
                  value={budget} 
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-yellow-500 shadow-inner"
                />
              </div>

              {/* Parameter 3 */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" /> Diversion Target
                  </label>
                  <span className="text-lg font-black text-emerald-400">{recyclingTarget}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" max="80" 
                  value={recyclingTarget} 
                  onChange={(e) => setRecyclingTarget(Number(e.target.value))}
                  className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-emerald-400 shadow-inner"
                />
              </div>

              {/* Toggle */}
              <div className="flex justify-between items-center pt-6 border-t border-border/50">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-widest text-foreground">AI Dynamic Routing</label>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Enables real-time pathfinding</p>
                </div>
                <button 
                  onClick={() => setDynamicRouting(!dynamicRouting)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative shadow-inner",
                    dynamicRouting ? "bg-emerald-500" : "bg-muted"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow-sm",
                    dynamicRouting ? "translate-x-7" : "translate-x-1"
                  )} />
                </button>
              </div>
            </div>

            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 relative z-10"
            >
              {isSimulating ? (
                <>Computing Neural Matrix...</>
              ) : (
                <><Play className="w-4 h-4 fill-current" /> Execute Simulation</>
              )}
            </button>
          </div>
        </div>

        {/* Projections Area */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <StatCard 
              label="5-Year Cost Projection"
              value={`$${(data[4].cost / 1000000).toFixed(2)}M`}
              unit="Total Simulated"
              change={{ value: data[4].cost < data[4].baselineCost ? 'Optimized' : 'Increased', positive: data[4].cost < data[4].baselineCost }}
              icon={TrendingDown}
              iconColor={data[4].cost < data[4].baselineCost ? "text-emerald-500" : "text-red-500"}
              onClick={() => toast.info('Cost analytics opened.')}
            />
            <StatCard 
              label="Carbon Emissions"
              value={`${(data[4].emissions / 1000).toFixed(1)}k`}
              unit="Tons Co2e"
              change={{ value: data[4].emissions < data[4].baselineEmissions ? 'Reduced' : 'Elevated', positive: data[4].emissions < data[4].baselineEmissions }}
              icon={Leaf}
              iconColor={data[4].emissions < data[4].baselineEmissions ? "text-emerald-500" : "text-orange-500"}
              onClick={() => toast.info('Emissions analytics opened.')}
            />
          </div>

          <div className="liquid-glass border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl flex-1 flex flex-col relative overflow-hidden group">
            <SectionHeader title="Financial & Environmental Impact" subtitle="Baseline (Dashed) vs Simulated Forecast (Solid)" />
            
            <div className="h-[300px] w-full mt-8 relative z-10 flex-1 group-hover:scale-[1.02] transition-transform duration-700">
              <DynamicChart>
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--foreground), 0.05)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsla(var(--card), 0.9)', backdropFilter: 'blur(12px)', border: '1px solid hsla(var(--border), 0.5)', borderRadius: '1rem', color: 'hsl(var(--foreground))', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 900 }} itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, fontSize: 12 }} />
                  
                  {/* Baseline projections - dashed */}
                  <Line type="monotone" dataKey="baselineCost" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />
                  <Line type="monotone" dataKey="baselineEmissions" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />

                  {/* Simulated projections - solid with area beneath */}
                  <Area type="monotone" dataKey="cost" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" activeDot={{ r: 6, strokeWidth: 0, fill: '#eab308' }} />
                  <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEmissions)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                </AreaChart>
              </ResponsiveContainer>
              </DynamicChart>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">AI Strategic Assessment</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-relaxed">
                  Based on the selected parameters, increasing the fleet size to {fleetSize} units while maintaining a budget of ${(budget / 1000000).toFixed(1)}M causes long-term compounding benefits for emissions, but significantly escalates 2028 baseline operating costs by {Math.abs(Math.round(((data[4].cost - data[4].baselineCost) / data[4].baselineCost) * 100))}% compared to historical norms.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
