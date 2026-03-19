'use client';

import { useState } from 'react';
import { 
  Zap, 
  ArrowUpRight, 
  BrainCircuit, 
  ShieldAlert, 
  TrendingDown, 
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Insight {
  id: string;
  type: 'prescription' | 'prediction' | 'diagnostic';
  priority: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  confidence: number;
  factors: string[];
  actionLabel?: string;
}

const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'i1',
    type: 'prediction',
    priority: 'critical',
    title: 'Zone B Overflow Imminent',
    description: 'Commercial waste volume in Zone B is 42% above seasonal average. Overflow probability is high by 16:00 today.',
    confidence: 94,
    factors: ['Local festival (+28% foot traffic)', 'Historical weekend anomaly patterns'],
    actionLabel: 'Pre-emptively Reroute Fleet V4'
  },
  {
    id: 'i2',
    type: 'prescription',
    priority: 'high',
    title: 'Route Inefficiency Detected',
    description: 'Current collection route for Zone A is experiencing a 15 min delay per node due to unexpected traffic construction.',
    confidence: 88,
    factors: ['Live traffic API data', 'V2 gps ping deltas'],
    actionLabel: 'Deploy Alternate Path Alpha'
  },
  {
    id: 'i3',
    type: 'diagnostic',
    priority: 'medium',
    title: 'Recycling Contamination Spike',
    description: 'Sensors detect a 12% rise in non-recyclable organics mixed in recycling bins across the University District.',
    confidence: 76,
    factors: ['Bin volumetric sensors', 'Optical sorting downstream feedback'],
    actionLabel: 'Schedule Public Awareness Campaign'
  }
];

export function InsightEngine() {
  const [insights, setInsights] = useState<Insight[]>(MOCK_INSIGHTS);

  const handleAction = (insightId: string, action: string) => {
    toast.success(`AI Action Executed: ${action}. The neural matrix has updated live operations.`);
    setInsights(prev => prev.filter(i => i.id !== insightId));
  };

  if (insights.length === 0) {
    return (
      <div className="liquid-glass border-white/10 rounded-[2rem] p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-50" />
        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">All Nominal</h3>
        <p className="text-xs text-muted-foreground mt-1">The Autonomous Engine detects no anomalies.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-outfit">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20">
          <BrainCircuit className="w-4 h-4 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Autonomous Insights</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Predictive & Prescriptive Engine</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            className={cn(
              "relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 border backdrop-blur-3xl group",
              insight.priority === 'critical' ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.05)]' :
              insight.priority === 'high' ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 shadow-[0_0_30px_rgba(249,115,22,0.05)]' :
              'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.05)]'
            )}
          >
            {/* Background Glow */}
            <div className={cn(
              "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity group-hover:opacity-40",
              insight.priority === 'critical' ? 'bg-red-500' :
              insight.priority === 'high' ? 'bg-orange-500' :
              'bg-blue-500'
            )} />

            <div className="relative z-10 flex gap-4">
              <div className="shrink-0 mt-1">
                {insight.priority === 'critical' ? <ShieldAlert className="w-5 h-5 text-red-500" /> :
                 insight.priority === 'high' ? <AlertTriangle className="w-5 h-5 text-orange-500" /> :
                 <Lightbulb className="w-5 h-5 text-blue-500" />}
              </div>
              <div className="space-y-3 flex-1 min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h3 className="text-sm font-black text-foreground truncate">{insight.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-background/50 border border-white/5 shadow-inner">
                      <Zap className={cn("w-3 h-3", 
                        insight.priority === 'critical' ? 'text-red-500' :
                        insight.priority === 'high' ? 'text-orange-500' :
                        'text-blue-500'
                      )} />
                      <span className="text-[10px] font-black">{insight.confidence}% AI Confidence</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {insight.description}
                  </p>
                </div>

                {/* Explainable AI (XAI) Factors */}
                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Influencing Factors</p>
                  <ul className="space-y-1">
                    {insight.factors.map((factor, idx) => (
                      <li key={idx} className="text-[10px] text-foreground/80 font-medium flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                {insight.actionLabel && (
                  <button 
                    onClick={() => handleAction(insight.id, insight.actionLabel!)}
                    className={cn(
                      "w-full mt-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-sm relative overflow-hidden group/btn",
                      insight.priority === 'critical' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' :
                      insight.priority === 'high' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border border-orange-500/20' :
                      'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20'
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">{insight.actionLabel} <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" /></span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
