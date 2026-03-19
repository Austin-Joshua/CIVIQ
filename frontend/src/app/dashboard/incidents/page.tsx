'use client';

import { AlertCircle, Clock, UserPlus, CheckCircle, Search, Filter, MoreHorizontal, MapPin } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

const MOCK_INCIDENTS = [
  { id: 'INC-1024', type: 'Hazardous Overflow', zone: 'Industrial Sector', severity: 'CRITICAL', status: 'ASSIGNED', assignee: 'Field_Sup_Jones', time: '12 mins ago' },
  { id: 'INC-1025', type: 'Illegal Dumping', zone: 'Residential East', severity: 'HIGH', status: 'REPORTED', assignee: null, time: '24 mins ago' },
  { id: 'INC-1026', type: 'Sensor Malfunction', zone: 'Port Side', severity: 'MEDIUM', status: 'RESOLVED', assignee: 'Ops_Analyst_Ray', time: '1 hour ago' },
  { id: 'INC-1027', type: 'Route Blockage', zone: 'Central Hub', severity: 'HIGH', status: 'IN_PROGRESS', assignee: 'Driver_V09', time: '3 hours ago' },
];

export default function IncidentCommandPage() {
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === id ? { ...inc, status: newStatus } : inc
    ));
    toast.success(`Incident ${id} updated to: ${newStatus}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-foreground">Incident Command</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Real-time Resolution Lifecycle Management
          </p>
        </div>
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search incidents..." 
                    className="pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>
            <button className="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                <Filter className="w-4 h-4 text-muted-foreground" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Statistics Column */}
        <div className="lg:col-span-1 space-y-4">
            <div className="p-6 bg-card/50 border border-border rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertCircle className="w-20 h-20 text-red-500" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Open Incidents</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-foreground">12</span>
                    <span className="text-xs font-bold text-red-500">+2 since hour</span>
                </div>
            </div>
            <div className="p-6 bg-card/50 border border-border rounded-[2rem]">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Avg Resolution</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-foreground">42m</span>
                    <span className="text-xs font-bold text-emerald-500">-8% decrease</span>
                </div>
            </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-3">
            <div className="bg-card/50 border border-border rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Incident ID</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type & Zone</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Severity</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assignee</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {incidents.map((inc) => (
                                <tr key={inc.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-5">
                                        <span className="text-sm font-black text-foreground">{inc.id}</span>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{inc.time}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <h4 className="text-sm font-black text-foreground leading-tight">{inc.type}</h4>
                                        <div className="flex items-center gap-1.5 mt-1 text-muted-foreground">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">{inc.zone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            inc.severity === 'CRITICAL' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
                                            inc.severity === 'HIGH' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                        )}>
                                            {inc.severity}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {inc.assignee ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                                                    {inc.assignee[0]}
                                                </div>
                                                <span className="text-[11px] font-bold text-foreground">{inc.assignee}</span>
                                            </div>
                                        ) : (
                                            <button 
                                              onClick={() => toast.info(`Assigning protocol for ${inc.id} launched.`)}
                                              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" /> Assign
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <select 
                                            value={inc.status} 
                                            onChange={(e) => handleStatusUpdate(inc.id, e.target.value)}
                                            className={cn(
                                                "bg-background border border-border rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-primary/40",
                                                inc.status === 'RESOLVED' ? "text-emerald-500" : 
                                                inc.status === 'REPORTED' ? "text-muted-foreground" : "text-primary"
                                            )}
                                        >
                                            <option value="REPORTED">Reported</option>
                                            <option value="ASSIGNED">Assigned</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-muted/10 border-t border-border flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Showing {incidents.length} of 14 Incidents</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-card border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Previous</button>
                        <button className="px-3 py-1 bg-card border border-border rounded-lg text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
