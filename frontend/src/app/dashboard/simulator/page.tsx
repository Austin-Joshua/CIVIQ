'use client';

import { useState } from 'react';
import { 
  Sliders, 
  Zap, 
  TrendingUp, 
  Trash2, 
  Leaf, 
  Search, 
  Maximize2, 
  Info,
  Clock,
  Play,
  RotateCcw,
  ArrowRight,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { cn } from '@/lib/utils';
import { SectionHeader } from '@/components/ui/Cards';
import { DynamicChart } from '@/components/ui/DynamicChart';
import { useUIStore } from '@/store/uiStore';

const INITIAL_SIM_DATA = [
  { month: 'Jan', current: 100, simulated: 100 },
  { month: 'Feb', current: 120, simulated: 110 },
  { month: 'Mar', current: 140, simulated: 115 },
  { month: 'Apr', current: 170, simulated: 120 },
  { month: 'May', current: 190, simulated: 125 },
  { month: 'Jun', current: 220, simulated: 130 },
];

export default function SimulatorPage() {
  const { openReport } = useUIStore();

  
  const [params, setParams] = useState({
    collectionFreq: 65,
    recyclingIncentive: 40,
    fuelTax: 20
  });

  const [simData, setSimData] = useState(INITIAL_SIM_DATA);

  const handleReset = () => {
    setParams({
      collectionFreq: 65,
      recyclingIncentive: 40,
      fuelTax: 20
    });
    setSimData(INITIAL_SIM_DATA);
  };

  const handleRunSimulation = () => {
    // Generate new mock data based on sliders
    const multiplier = 1 - (params.recyclingIncentive / 200) + (params.collectionFreq / 300);
    const newSimData = INITIAL_SIM_DATA.map(d => ({
      ...d,
      simulated: Math.round(d.current * (multiplier - (INITIAL_SIM_DATA.indexOf(d) * 0.05)))
    }));
    setSimData(newSimData);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground mb-1 flex items-center gap-3">
            <Sliders className="w-8 h-8 text-emerald-500" /> Simulator
          </h1>
          <p className="text-muted-foreground font-medium">
            Model policy changes and visualize urban impact.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Model
          </button>
          <button 
            onClick={handleRunSimulation}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-xl shadow-emerald-900/30 uppercase tracking-widest"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Simulate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Parameters Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="liquid-glass border border-white/10 rounded-[2rem] p-6 shadow-2xl">
            <SectionHeader title="Simulation Variables" subtitle="Adjust urban policy sliders" />
            
            <div className="space-y-8 mt-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Collection Freq</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{params.collectionFreq}%</span>
                </div>
                <input type="range" value={params.collectionFreq} onChange={(e) => setParams({...params, collectionFreq: parseInt(e.target.value)})} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recycling Incentive</span>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400">{params.recyclingIncentive}%</span>
                </div>
                <input type="range" value={params.recyclingIncentive} onChange={(e) => setParams({...params, recyclingIncentive: parseInt(e.target.value)})} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fleet Fuel Tax</span>
                  <span className="text-xs font-bold text-orange-500 dark:text-orange-400">{params.fuelTax}%</span>
                </div>
                <input type="range" value={params.fuelTax} onChange={(e) => setParams({...params, fuelTax: parseInt(e.target.value)})} className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 space-y-4">
              <div className="flex items-start gap-3 p-4 bg-background/40 hover:bg-background/60 transition-colors border border-white/5 rounded-xl cursor-pointer group">
                <Target className="w-4 h-4 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Target Zone</p>
                  <p className="text-sm font-bold text-foreground">Zone C - Industrial</p>
                </div>
              </div>
              
              {/* Confidence Score readout */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 blur-2xl rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 border-b border-emerald-500/10 pb-2">AI Confidence Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tighter text-foreground">94</span>
                  <span className="text-sm font-bold text-muted-foreground mb-1">%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed font-medium">Model reliability based on historical matching of selected policy sliders.</p>
              </div>

            </div>
          </div>
        </div>

        {/* Results Graph Column */}
        <div className="lg:col-span-3 space-y-6">
          <div className="liquid-glass-panel border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full -mr-48 -mt-48 pointer-events-none" />
            
            <SectionHeader title="Projected Environmental Impact" subtitle="Simulated vs Current historical baseline across next 6 months" />
            
            <div className="h-[360px] w-full mt-6 scale-100 group-hover:scale-[1.01] transition-transform duration-700 relative z-10">
              <DynamicChart>
                <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={simData}>
                  <defs>
                    <linearGradient id="simArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} labelStyle={{ color: '#fff', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 600 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800', opacity: 0.6 }} />
                  <Area type="monotone" dataKey="simulated" fill="url(#simArea)" stroke="none" />
                  <Line type="monotone" dataKey="current" stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeDasharray="5 5" name="Historical Baseline" dot={false} />
                  <Line type="monotone" dataKey="simulated" stroke="#10b981" strokeWidth={4} name="Simulated Scenario" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#020617' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
              </DynamicChart>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-border/50 relative z-10">
              <div 
                className="flex items-center gap-4 cursor-pointer hover:bg-emerald-500/10 p-4 rounded-2xl transition-all border border-transparent hover:border-emerald-500/20 group/stat"
                onClick={() => openReport('stat', { label: 'Sustainability Impact', value: '+18.4%', unit: 'Score' })}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                  <Leaf className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Sustainability</p>
                  <p className="text-xl font-black text-foreground tracking-tight">+18.4%</p>
                </div>
              </div>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:bg-teal-500/10 p-4 rounded-2xl transition-all border border-transparent hover:border-teal-500/20 group/stat"
                onClick={() => openReport('stat', { label: 'Economic Gain', value: '42.8K', unit: '$ Value' })}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-teal-500 dark:text-teal-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Economic Gain</p>
                  <p className="text-xl font-black text-foreground tracking-tight">$42.8K</p>
                </div>
              </div>
              <div 
                className="flex items-center gap-4 cursor-pointer hover:bg-orange-500/10 p-4 rounded-2xl transition-all border border-transparent hover:border-orange-500/20 group/stat"
                onClick={() => openReport('stat', { label: 'Waste Impact', value: '1.2', unit: 'Tons' })}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover/stat:scale-110 transition-transform">
                  <ArrowRight className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Net Impact</p>
                  <p className="text-xl font-black text-foreground tracking-tighter">-1.2 Tons</p>
                </div>
              </div>
            </div>
            
            {/* Prediction Explanation */}
            <div className="mt-6 p-5 rounded-2xl bg-muted/20 border border-white/5 flex gap-4">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                 <Zap className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                 <p className="text-xs font-black uppercase tracking-widest text-foreground block mb-2">Analysis Insight</p>
                 <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                   Increasing the <strong>Recycling Incentive</strong> to {params.recyclingIncentive}% correlates strongly with a rapid drop in mixed waste volume during the first 3 months. The model compensates by predicting a minor efficiency loss in collection routes, offset by the fuel tax reduction.
                 </p>
               </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
