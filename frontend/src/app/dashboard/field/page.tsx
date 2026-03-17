'use client';

import { useState } from 'react';
import { Truck, MapPin, CheckCircle2, AlertTriangle, ChevronRight, Navigation2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/providers/ToastProvider';

const ROUTE_STOPS = [
  { id: '1', binId: 'B-104', location: '142 Market St', status: 'completed', fill: 92 },
  { id: '2', binId: 'B-105', location: '150 Market St', status: 'next', fill: 88 },
  { id: '3', binId: 'B-210', location: 'Pine & 4th', status: 'pending', fill: 64 },
  { id: '4', binId: 'B-211', location: 'Pine & 5th', status: 'pending', fill: 45 },
];

export default function FieldOpsPage() {
  const [stops, setStops] = useState(ROUTE_STOPS);
  const { toast } = useToast();

  const activeStop = stops.find(s => s.status === 'next');

  const completeStop = (id: string) => {
    setStops(current => {
      const updated = current.map(s => s.id === id ? { ...s, status: 'completed' } : s);
      const nextPendingIdx = updated.findIndex(s => s.status === 'pending');
      if (nextPendingIdx !== -1) {
        updated[nextPendingIdx].status = 'next';
      }
      return updated;
    });
    toast({ title: 'Stop Completed', type: 'success', description: 'Collection logged. Proceed to next waypoint.' });
  };

  const reportIssue = () => {
    toast({ title: 'Issue Reported', type: 'warning', description: 'Dispatcher notified. Awaiting instructions.' });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] md:min-h-0 space-y-6 pb-20 md:pb-0">
      {/* Mobile Header */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Truck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Vehicle V-09</h2>
            <p className="text-[10px] text-primary uppercase tracking-widest font-bold">Route R-001 Active</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-lg font-bold text-foreground tracking-tight">
            {stops.filter(s => s.status === 'completed').length}/{stops.length}
          </p>
        </div>
      </div>

      {/* Active Navigation Panel */}
      {activeStop ? (
        <div className="bg-emerald-500 text-[#051109] rounded-3xl p-6 shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="px-3 py-1 bg-[#051109]/10 rounded-full text-[10px] font-bold uppercase tracking-widest">Next Waypoint</span>
            <span className="text-sm font-bold flex items-center gap-1.5"><Navigation2 className="w-4 h-4" /> 1.2 mi</span>
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight mb-1">{activeStop.location}</h3>
            <p className="text-emerald-900 font-bold text-sm mb-8">Bin {activeStop.binId} • {activeStop.fill}% Fill Level</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => completeStop(activeStop.id)}
                className="col-span-2 py-4 bg-[#051109] text-emerald-400 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#0a1f12] transition-colors shadow-lg active:scale-[0.98]"
              >
                <CheckCircle2 className="w-5 h-5" /> Mark Collected
              </button>
              <button className="py-3 bg-[#051109]/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#051109]/20 transition-colors">
                <Camera className="w-4 h-4" /> Photo
              </button>
              <button 
                onClick={reportIssue}
                className="py-3 bg-red-500/10 text-red-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Report Issue
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">Route Complete</h3>
          <p className="text-sm text-muted-foreground mb-6">All waypoints for this shift have been cleared. Return to depot.</p>
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors">
            End Shift
          </button>
        </div>
      )}

      {/* Itinerary List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">Itinerary</h3>
        <div className="bg-card/50 border border-border rounded-2xl overflow-hidden">
          {stops.map((stop, index) => (
            <div key={stop.id} className={cn(
              "flex items-center gap-4 p-4 border-b border-border last:border-0",
              stop.status === 'completed' && "opacity-50",
              stop.status === 'next' && "bg-muted/30"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                stop.status === 'completed' ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                stop.status === 'next' ? "bg-emerald-500 text-white" :
                "bg-foreground/5 text-muted-foreground"
              )}>
                {stop.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold truncate", stop.status === 'completed' ? "text-muted-foreground line-through" : "text-foreground")}>
                  {stop.location}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{stop.binId}</p>
              </div>
              {stop.status === 'pending' && <ChevronRight className="w-4 h-4 text-muted-foreground/50" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
