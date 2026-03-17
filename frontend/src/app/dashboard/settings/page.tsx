'use client';

import { Settings, User, Bell, Shield, Database, Smartphone, Palette, Globe, ChevronRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionHeader title="Account Settings" subtitle="Manage your dashboard preferences and security configurations." />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card/50 border border-border rounded-2xl p-8 space-y-10">
            
            <section className="space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-l-2 border-emerald-500/40 pl-3">System Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Language</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Primary language for the command center</p>
                  </div>
                  <select className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary/50">
                    <option>English (US)</option>
                    <option>Español</option>
                    <option>Français</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Auto-Optimization</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Allow AI to apply routing changes automatically</p>
                  </div>
                  <div className="w-10 h-5 bg-emerald-500/20 border border-emerald-500/40 rounded-full relative cursor-pointer group">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-emerald-500 rounded-full" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Alert Threshold</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Percentage to trigger bin overflow alerts</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-bold tracking-widest">85%</span>
                    <input type="range" className="accent-emerald-500 h-1" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-l-2 border-orange-500/40 pl-3">Integration Keys</h3>
              <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">City GIS API Key</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-widest">Active • Expires Oct 2026</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest px-3 py-1 bg-foreground/5 rounded-md transition-all">Revoke</button>
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
