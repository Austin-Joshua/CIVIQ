'use client';

import { 
  Settings, User, Bell, Shield, Database, Smartphone, Palette, Globe, 
  ChevronRight, Activity, XCircle, CheckCircle2, Terminal, Copy, 
  ExternalLink, Info, AlertTriangle, Key, Users, Building, CreditCard, TrendingUp, BarChart2
} from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from 'next-themes';
import { Toaster, toast } from 'sonner';
import { downloadCsvFile } from '@/lib/download';

const AUDIT_LOGS = [
  { time: '2026-03-19 14:32:01', user: 'Dr. Sarah Chen', action: 'UPDATE_ROLE', details: 'Changed Marcus Johnson to OPS_MANAGER' },
  { time: '2026-03-19 12:15:44', user: 'System', action: 'CREATE_ZONE', details: 'Automated zone generation for Downtown area' },
  { time: '2026-03-18 09:05:12', user: 'Elena Rodriguez', action: 'EXPORT_DATA', details: 'Downloaded last 30 days waste forecasting data' },
  { time: '2026-03-17 18:44:20', user: 'Marcus Johnson', action: 'UPDATE_ROUTE', details: 'Manually overrode route optimization #773' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [envKeyDetected, setEnvKeyDetected] = useState(false);

  // Form states
  const [generalSettings, setGeneralSettings] = useState({
    language: 'English (US)',
    autoOptimize: true,
    alertThreshold: 85,
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [profileSettings, setProfileSettings] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@civiq.city',
    role: user?.role || 'ADMIN'
  });

  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    criticalOnly: false
  });

  useEffect(() => {
    setEnvKeyDetected(!!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSave = () => {
    toast.success('Settings saved successfully', {
      description: 'Your changes have been applied to the system.'
    });
  };

  const handleAuditExport = () => {
    downloadCsvFile(
      [
        ['timestamp', 'user', 'action', 'details'],
        ...AUDIT_LOGS.map((log) => [log.time, log.user, log.action, log.details]),
      ],
      `audit-logs-${Date.now()}.csv`
    );
    toast.success('Audit log CSV downloaded.');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'organization', label: 'Organization', icon: Building },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'billing', label: 'Subscription & Usage', icon: CreditCard },
    { id: 'audit', label: 'Audit Logs', icon: Activity },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <SectionHeader title="Account Settings" subtitle="Manage your dashboard preferences and security configurations." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                activeTab === tab.id 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-4 h-4 transition-colors", activeTab === tab.id ? "text-emerald-500" : "group-hover:text-emerald-500/70")} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto animate-in fade-in slide-in-from-left-1" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card/50 border border-border rounded-2xl p-8 space-y-10 min-h-[550px] flex flex-col relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex-1">
              {activeTab === 'general' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <Settings className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest ">System Preferences</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4 border-b border-border/50">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Language</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Primary language for the command center</p>
                        </div>
                        <select 
                          value={generalSettings.language}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                          className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-emerald-500/50 transition-all hover:bg-muted/10 cursor-pointer"
                        >
                          <option>English (US)</option>
                          <option>Español</option>
                          <option>Français</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-border/50">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Auto-Optimization</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Allow AI to apply routing changes automatically</p>
                        </div>
                        <button 
                          onClick={() => setGeneralSettings({ ...generalSettings, autoOptimize: !generalSettings.autoOptimize })}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-all duration-300 border shadow-inner",
                            generalSettings.autoOptimize ? "bg-emerald-500 border-emerald-600" : "bg-muted border-border"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm",
                            generalSettings.autoOptimize ? "right-0.5" : "left-0.5"
                          )} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-border/50">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Alert Threshold</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Percentage to trigger bin overflow alerts</p>
                        </div>
                        <div className="flex items-center gap-4 min-w-[150px]">
                          <span className="text-xs text-emerald-500 font-bold tracking-widest w-8">{generalSettings.alertThreshold}%</span>
                          <input 
                            type="range" 
                            min="50"
                            max="100"
                            value={generalSettings.alertThreshold}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, alertThreshold: parseInt(e.target.value) })}
                            className="accent-emerald-500 h-1 flex-1 cursor-pointer" 
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-2 border-orange-500/40 pl-3">
                      <Database className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Integration Keys</h3>
                    </div>
                    <div className="p-5 bg-card border border-border rounded-2xl space-y-5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                            generalSettings.apiKey ? "bg-emerald-500/10 border-emerald-500/20" : "bg-orange-500/10 border-orange-500/20"
                          )}>
                            <Globe className={cn("w-6 h-6 transition-colors duration-500", generalSettings.apiKey ? "text-emerald-500" : "text-orange-500")} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Google Maps Platform</p>
                            <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest font-medium">
                              Status: {generalSettings.apiKey ? (
                                <span className="text-emerald-500 flex items-center gap-1.5 inline-flex">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Operational
                                </span>
                              ) : (
                                <span className="text-orange-500">Key Required</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setShowSetupWizard(true)}
                          className="text-[10px] font-bold text-emerald-500 hover:text-white hover:bg-emerald-500 px-4 py-2 bg-emerald-500/10 rounded-xl transition-all uppercase tracking-widest outline-none border border-emerald-500/20"
                        >
                          Setup Wizard
                        </button>
                      </div>

                      {/* Environment Detector Alert */}
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border text-[11px] font-medium transition-all duration-500",
                        envKeyDetected 
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                          : "bg-orange-500/5 border-orange-500/20 text-orange-600 dark:text-orange-400"
                      )}>
                        {envKeyDetected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>System detected `.env.local` configuration. Manual override active.</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>No environment variable detected. Mapping requires manual key input below.</span>
                          </>
                        )}
                      </div>

                      <div className="space-y-3">
                         <div className="relative group">
                           <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-emerald-500 transition-colors" />
                           <input 
                            type="password"
                            value={generalSettings.apiKey}
                            onChange={(e) => setGeneralSettings({ ...generalSettings, apiKey: e.target.value })}
                            placeholder="Enter your API Key (AIza...)"
                            className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-foreground outline-none focus:border-emerald-500/50 transition-all"
                           />
                         </div>
                         <p className="text-[10px] text-muted-foreground leading-relaxed italic opacity-70">
                           {generalSettings.apiKey 
                             ? "Real-time mapping is currently enabled via the provided operational key."
                             : "Mission-critical spatial intelligence is disabled. Provide a Cloud Console key to restore global maps and route analysis."
                           }
                         </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'organization' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <Building className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Organization Profile</h3>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 liquid-glass-panel rounded-2xl">
                      <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-3xl shadow-lg border border-emerald-500/30 glow-accent">
                        CT
                      </div>
                      <div className="space-y-3 text-center md:text-left flex-1">
                        <div>
                          <h4 className="text-xl font-black text-foreground">CIVIQ Demo City</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">Enterprise Subscription • 24 Users</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          <button className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest shadow-lg shadow-emerald-900/20">Edit Details</button>
                          <button className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-xs font-bold rounded-lg transition-all">Manage Billing</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Workspace Name</label>
                        <input type="text" defaultValue="CIVIQ Demo City" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Primary Domain</label>
                        <input type="text" defaultValue="demo.civiq.city" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <Users className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Team Management</h3>
                    </div>
                    <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                      + Invite User
                    </button>
                  </div>
                  
                  <div className="liquid-glass border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-4 px-6 py-4 border-b border-border/50 bg-muted/20 text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <div className="col-span-2">User details</div>
                      <div>Role Assignment</div>
                      <div className="text-right">Action</div>
                    </div>
                    
                    <div className="divide-y divide-border/50 bg-background/50 backdrop-blur-md">
                      {[
                        { name: 'Dr. Sarah Chen', email: 's.chen@civiq.city', role: 'SUPER_ADMIN' },
                        { name: 'Marcus Johnson', email: 'm.johnson@civiq.city', role: 'OPS_MANAGER' },
                        { name: 'Elena Rodriguez', email: 'e.rodriguez@civiq.city', role: 'ANALYST' },
                      ].map((item, i) => (
                        <div key={i} className="grid grid-cols-4 items-center px-6 py-4 hover:bg-muted/30 transition-colors">
                          <div className="col-span-2 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                              {item.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">{item.email}</p>
                            </div>
                          </div>
                          <div>
                            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                              {item.role}
                            </span>
                          </div>
                          <div className="text-right">
                            <button className="text-[10px] uppercase font-bold text-muted-foreground hover:text-emerald-500 transition-colors tracking-widest px-3 py-1.5 hover:bg-emerald-500/10 rounded-lg">
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'audit' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Audit Logs</h3>
                    </div>
                    <button onClick={handleAuditExport} className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-xs font-bold rounded-xl transition-all">
                      Export CSV
                    </button>
                  </div>
                  
                  <div className="liquid-glass border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-12 px-6 py-4 border-b border-border/50 bg-muted/20 text-xs font-black uppercase tracking-widest text-muted-foreground gap-4">
                      <div className="col-span-3">Timestamp</div>
                      <div className="col-span-2">User</div>
                      <div className="col-span-2">Action</div>
                      <div className="col-span-5">Details</div>
                    </div>
                    
                    <div className="divide-y divide-border/50 bg-background/50 backdrop-blur-md">
                      {AUDIT_LOGS.map((log, i) => (
                        <div key={i} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-muted/30 transition-colors gap-4">
                           <div className="col-span-3 text-[11px] font-mono text-muted-foreground">
                             {log.time}
                           </div>
                           <div className="col-span-2 text-xs font-bold text-foreground truncate">
                             {log.user}
                           </div>
                           <div className="col-span-2">
                             <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                               {log.action}
                             </span>
                           </div>
                           <div className="col-span-5 text-xs text-muted-foreground truncate" title={log.details}>
                             {log.details}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Subscription & Usage</h3>
                    </div>
                    <button className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-xs font-bold rounded-xl transition-all">
                      Billing History
                    </button>
                  </div>
                  
                  {/* Subscription Plan Card */}
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none transition-transform group-hover:scale-110" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                       <div>
                         <div className="flex items-center gap-3 mb-2">
                           <h4 className="text-2xl font-black tracking-tight text-foreground">Enterprise Multi-Tenant</h4>
                           <span className="px-2.5 py-1 rounded bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Active</span>
                         </div>
                         <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Renews on Oct 1, 2026 • 24/50 Seats Utilized</p>
                       </div>
                       <div className="text-left md:text-right">
                         <p className="text-4xl font-black text-foreground">$4,250<span className="text-lg text-muted-foreground">/mo</span></p>
                         <button className="mt-4 px-6 py-2 bg-background/50 hover:bg-background/80 backdrop-blur-md border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm">
                           Change Plan
                         </button>
                       </div>
                    </div>
                  </div>

                  {/* Usage Analytics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                           <Database className="w-5 h-5 text-blue-500" />
                         </div>
                         <p className="text-xs font-bold text-foreground uppercase tracking-widest">API Requests</p>
                       </div>
                       <div>
                         <div className="flex items-end gap-2 mb-2">
                           <span className="text-3xl font-black text-foreground tracking-tight">1.2M</span>
                           <span className="text-xs font-bold text-muted-foreground mb-1">/ 2M Limit</span>
                         </div>
                         <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                           <div className="w-[60%] h-full bg-blue-500" />
                         </div>
                       </div>
                     </div>

                     <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between group hover:border-orange-500/30 transition-all">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                           <TrendingUp className="w-5 h-5 text-orange-500" />
                         </div>
                         <p className="text-xs font-bold text-foreground uppercase tracking-widest">Simulation Compute</p>
                       </div>
                       <div>
                         <div className="flex items-end gap-2 mb-2">
                           <span className="text-3xl font-black text-foreground tracking-tight">412</span>
                           <span className="text-xs font-bold text-muted-foreground mb-1">hrs / 500 Limit</span>
                         </div>
                         <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                           <div className="w-[82%] h-full bg-orange-500" />
                         </div>
                       </div>
                     </div>

                     <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between group hover:border-emerald-500/30 transition-all md:col-span-2 lg:col-span-1">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                           <BarChart2 className="w-5 h-5 text-emerald-500" />
                         </div>
                         <p className="text-xs font-bold text-foreground uppercase tracking-widest">AI Predictions</p>
                       </div>
                       <div>
                         <div className="flex items-end gap-2 mb-2">
                           <span className="text-3xl font-black text-foreground tracking-tight">84k</span>
                           <span className="text-xs font-bold text-muted-foreground mb-1">/ 100k Limit</span>
                         </div>
                         <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                           <div className="w-[84%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <User className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Profile Configuration</h3>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-muted/20 border border-border rounded-2xl">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-emerald-500/30 group-hover:scale-[1.05] transition-transform duration-500">
                           <img src="/globe.svg" className="w-full h-full object-contain rounded-3xl opacity-20 absolute p-3" alt="" />
                           <span className="relative z-10">{profileSettings.name[0]}</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-3xl cursor-pointer">
                          <Palette className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-3 text-center md:text-left">
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{profileSettings.name}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">{profileSettings.role}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          <button className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all uppercase tracking-widest shadow-lg shadow-emerald-900/20">Upload Photo</button>
                          <button className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-xs font-bold rounded-lg transition-all">Reset</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Identity Name</label>
                        <input 
                          type="text" 
                          value={profileSettings.name}
                          onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Secure Email Endpoint</label>
                        <input 
                          type="email" 
                          value={profileSettings.email}
                          onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Access Protocol</label>
                        <div className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-muted-foreground cursor-not-allowed flex items-center justify-between">
                          <span>{profileSettings.role} Level Access</span>
                          <Shield className="w-3.5 h-3.5 opacity-30" />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <Bell className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Protocol Alerts</h3>
                    </div>
                    
                    <div className="space-y-2 bg-muted/10 rounded-2xl p-2 border border-border/50">
                      {[
                        { id: 'email', label: 'Email Dispatch', desc: 'Sync summaries and critical anomaly reports' },
                        { id: 'push', label: 'Real-time Uplink', desc: 'Instant heads-up notifications in control center' },
                        { id: 'criticalOnly', label: 'Priority Only', desc: 'Silence low-priority system status logs' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 hover:bg-card/50 rounded-xl transition-all border-b border-border last:border-0 group">
                          <div className="flex items-center gap-4">
                             <div className="w-2 h-2 rounded-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
                             <div>
                               <p className="text-sm font-bold text-foreground">{item.label}</p>
                               <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                             </div>
                          </div>
                          <button 
                            onClick={() => setNotifSettings({ ...notifSettings, [item.id]: !notifSettings[item.id as keyof typeof notifSettings] })}
                            className={cn(
                              "w-11 h-6 rounded-full relative transition-all duration-300 border shadow-inner",
                              notifSettings[item.id as keyof typeof notifSettings] ? "bg-emerald-500 border-emerald-600 shadow-emerald-900/10" : "bg-muted border-border"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-all duration-300 shadow-lg",
                              notifSettings[item.id as keyof typeof notifSettings] ? "right-1" : "left-1"
                            )} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-l-2 border-red-500/40 pl-3">
                      <Shield className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Security Cryptography</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Operational Password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-red-500/40 focus:ring-4 focus:ring-red-500/5 outline-none transition-all" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">New Command Credential</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all" />
                         </div>
                      </div>
                      <button className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded-xl transition-all uppercase tracking-[0.2em] border border-red-500/20 shadow-lg shadow-red-500/10">Authorize Update</button>
                    </div>

                    <div className="mt-12 pt-10 border-t border-border/50">
                      <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" /> Active Uplink Sessions
                      </h4>
                      <div className="p-5 bg-muted/10 border border-border/60 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border/60 shadow-sm group-hover:shadow-md transition-all">
                            <Smartphone className="w-6 h-6 text-emerald-500" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">Current Workstation • Chennai, IN</p>
                            <div className="flex items-center gap-2 mt-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                               <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</p>
                            </div>
                          </div>
                        </div>
                        <button className="text-[9px] font-bold text-muted-foreground hover:text-red-500 uppercase tracking-widest px-3 py-1.5 hover:bg-red-500/5 rounded-lg transition-all">Revoke</button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <section className="space-y-8">
                    <div className="flex items-center gap-3 border-l-2 border-emerald-500/40 pl-3">
                      <Palette className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">UI Interface Engine</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div 
                        onClick={() => setTheme('light')}
                        className={cn(
                          "group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden",
                          theme === 'light' ? "border-emerald-500 bg-emerald-500/5 ring-8 ring-emerald-500/5" : "border-border bg-card/60 hover:border-emerald-500/30 cursor-pointer"
                        )}
                      >
                        <div className="h-32 bg-slate-50 rounded-2xl border border-slate-200 mb-4 shadow-sm flex flex-col p-3 gap-2 overflow-hidden group-hover:scale-[1.02] transition-transform">
                           <div className="w-1/2 h-2 bg-slate-200 rounded-full" />
                           <div className="w-1/3 h-2 bg-slate-100 rounded-full" />
                           <div className="mt-auto flex justify-between">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100" />
                              <div className="w-20 h-8 rounded-lg bg-slate-100" />
                           </div>
                        </div>
                        <p className={cn("text-xs font-bold text-center uppercase tracking-widest", theme === 'light' ? "text-emerald-500" : "text-muted-foreground")}>Surface Light</p>
                      </div>

                      <div 
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden",
                          theme === 'dark' ? "border-emerald-500 bg-emerald-500/5 ring-8 ring-emerald-500/5" : "border-border bg-card/60 hover:border-emerald-500/30 cursor-pointer"
                        )}
                      >
                        <div className="h-32 bg-slate-950 rounded-2xl border border-slate-800 mb-4 shadow-xl flex flex-col p-3 gap-2 overflow-hidden group-hover:scale-[1.02] transition-transform">
                           <div className="w-1/2 h-2 bg-slate-800 rounded-full" />
                           <div className="w-1/3 h-2 bg-slate-900 rounded-full" />
                           <div className="mt-auto flex justify-between">
                              <div className="w-8 h-8 rounded-lg bg-emerald-500/20" />
                              <div className="w-20 h-8 rounded-lg bg-slate-800" />
                           </div>
                        </div>
                        <p className={cn("text-xs font-bold text-center uppercase tracking-widest", theme === 'dark' ? "text-emerald-500" : "text-muted-foreground")}>Neural Dark</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className="pt-10 mt-10 border-t border-border/40 flex justify-end">
              <button 
                onClick={handleSave}
                className="group relative px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-[1.25rem] transition-all shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Wizard Modal */}
      {showSetupWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-xl w-full bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowSetupWizard(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-all"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Key className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-foreground">Spatial Setup Guide</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The CIVIQ command center requires <span className="text-emerald-500 font-bold underline decoration-emerald-500/30 underline-offset-4">Google Maps Intelligence</span> for real-time asset tracking and route prediction.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Step 1: Obtain Endpoint Credential</h4>
                  <div className="p-4 bg-muted/30 border border-border rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Cloud Console Registry</p>
                        <p className="text-[10px] text-muted-foreground">Enable Maps SDK & Routes API</p>
                      </div>
                    </div>
                    <a href="https://console.cloud.google.com/" target="_blank" className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Step 2: Environment Injection</h4>
                  <div className="p-4 bg-slate-900 border border-emerald-500/20 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-mono text-emerald-400">.env.local</span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE');
                          toast.success('Copied to clipboard');
                        }}
                        className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/50"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto">
                      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
                    </pre>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium italic">
                  * All coordinates are processed locally on-device.
                </p>
                <button 
                  onClick={() => setShowSetupWizard(false)}
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-900/40"
                >
                  Confirm Integration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
