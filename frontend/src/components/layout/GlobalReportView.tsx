'use client';

import { useUIStore } from '@/store/uiStore';
import { ReportModal } from '@/components/ui/Cards';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Map as MapIcon, 
  Trash2, 
  Clock, 
  MapPin, 
  ShieldAlert,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const MOCK_HISTORY_DATA = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 52 },
  { time: '08:00', value: 88 },
  { time: '12:00', value: 94 },
  { time: '16:00', value: 82 },
  { time: '20:00', value: 65 },
  { time: '23:59', value: 48 },
];

export function GlobalReportView() {
  const { activeReport, closeReport } = useUIStore();

  if (!activeReport) return null;

  const { type, data } = activeReport;

  const renderContent = () => {
    switch (type) {
      case 'stat':
        return (
          <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 border border-border rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Metric</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-foreground">{data.value}</span>
                  <span className="text-sm font-bold text-muted-foreground mb-1">{data.unit}</span>
                </div>
              </div>
              <div className="p-4 bg-muted/30 border border-border rounded-2xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Weekly Change</p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    data.change?.positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {data.change?.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <span className={cn("text-lg font-black", data.change?.positive ? "text-emerald-500" : "text-red-500")}>
                    {data.change?.value}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Analytics */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">24-Hour Intensity</h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">REAL-TIME SYNC</span>
              </div>
              <div className="h-64 w-full bg-card/50 border border-border rounded-2xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MOCK_HISTORY_DATA}>
                    <defs>
                      <linearGradient id="reportGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} 
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '10px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#reportGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Insights */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Operational Intelligence</h3>
              <div className="space-y-3">
                {[
                  { label: 'Forecast Accuracy', value: '98.2%', icon: TrendingUp },
                  { label: 'Network Latency', value: '14ms', icon: Clock },
                  { label: 'Resource Allocation', value: 'Optimized', icon: ShieldAlert },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-card/50 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center text-muted-foreground">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'alert':
        return (
          <div className="space-y-8">
            <div className={cn(
              "p-6 rounded-2xl border flex flex-col items-center text-center gap-4",
              data.severity === 'CRITICAL' ? "bg-red-500/5 border-red-500/20" : "bg-orange-500/5 border-orange-500/20"
            )}>
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
                data.severity === 'CRITICAL' ? "bg-red-500 text-white shadow-red-500/20" : "bg-orange-500 text-white shadow-orange-500/20"
              )}>
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground">{data.type}</h3>
                <p className="text-sm text-muted-foreground font-medium mt-1">{data.message}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Location
                </p>
                <p className="text-sm font-black text-foreground">Zone C - District 04</p>
              </div>
              <div className="p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Detected
                </p>
                <p className="text-sm font-black text-foreground">{data.time}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Next Action Steps</h3>
              <div className="space-y-3">
                <button className="w-full p-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-between group">
                  Dispatch Field Unit <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <button className="w-full p-4 rounded-xl bg-card border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors text-left flex items-center justify-between group">
                  Reroute Secondary Fleet <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
                <button className="w-full p-4 rounded-xl bg-card border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors text-left">
                  Mark as Maintenance Log
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>No detailed view available for this report type.</div>;
    }
  };

  return (
    <ReportModal 
      isOpen={!!activeReport} 
      onClose={closeReport}
      title={type === 'stat' ? `${data.label} Analysis` : `Incident Report: ${data.type}`}
      subtitle={type === 'stat' ? 'Platform Operational Intelligence' : `Detected ${data.time}`}
    >
      {renderContent()}
    </ReportModal>
  );
}
