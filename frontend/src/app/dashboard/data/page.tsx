'use client';

import { useState } from 'react';
import { Database, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, HardDrive, Network, GitMerge, FileCheck, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { SectionHeader } from '@/components/ui/Cards';
import { useToast } from '@/components/providers/ToastProvider';
import { cn } from '@/lib/utils';

export default function DataManagementPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({ title: 'Invalid File Format', description: 'Please upload a valid CSV file.', type: 'error' });
      return;
    }

    setIsUploading(true);
    
    // Simulate upload and processing
    setTimeout(() => {
      setIsUploading(false);
      toast({ 
        title: 'Data Ingestion Complete', 
        description: `Successfully imported 1,420 records from ${file.name} into the analytics engine.`, 
        type: 'success' 
      });
    }, 2500);
  };

  return (
    <div className="space-y-6 lg:space-y-8 font-outfit">
      <SectionHeader title="Data Integration & Lineage" subtitle="Import datasets, view upload validation reports, and trace data transformations." />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Left Column: Import and Lineage */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Bulk Import Zone */}
          <div className="liquid-glass border border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-inner shadow-emerald-500/20">
                <UploadCloud className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Bulk Data Import</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Upload verified CSV datasets for pipeline injection</p>
              </div>
            </div>

            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "w-full h-56 border border-dashed rounded-[1.5rem] flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer relative overflow-hidden z-10 bg-background/50 backdrop-blur-sm",
                isDragging ? "border-emerald-500 bg-emerald-500/10 scale-[1.02] shadow-[0_0_30px_rgba(16,185,129,0.1)]" : "border-border hover:border-emerald-500/30 hover:bg-emerald-500/5"
              )}
            >
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                  <div>
                    <p className="text-sm font-black text-foreground tracking-widest uppercase">Validating Schema...</p>
                    <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest">Running integrity checks</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-black text-foreground mb-1 uppercase tracking-widest">Drag & Drop CSV File</h4>
                  <p className="text-[10px] text-muted-foreground font-bold max-w-sm leading-relaxed uppercase tracking-widest opacity-60">
                    Max size: 50MB. Enforces strict schema validation.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Data Lineage Visualization */}
          <div className="liquid-glass-panel border border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-background/80 to-transparent pointer-events-none z-0" />
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <Network className="w-5 h-5 text-teal-500" />
               <h3 className="text-lg font-black text-foreground tracking-tight">Active Data Lineage</h3>
             </div>
             
             <div className="relative z-10 p-6 bg-card/40 border border-border/50 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Source Node */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-white/10 flex items-center justify-center shadow-lg group-hover:border-teal-500/50 group-hover:bg-teal-500/10 transition-all">
                     <Database className="w-6 h-6 text-muted-foreground group-hover:text-teal-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Raw Sensors</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pt-1">Source DB</p>
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-border hidden md:block" />

                {/* Transformer Node */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer relative">
                  <div className="absolute -top-3 -right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] font-black text-background border-2 border-card shadow-sm z-10 animate-bounce">
                    Active
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shadow-teal-500/20">
                     <GitMerge className="w-6 h-6 text-teal-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Anomaly Filter</p>
                    <p className="text-[9px] font-bold text-teal-500 uppercase tracking-widest pt-1">Transformation</p>
                  </div>
                </div>

                <ArrowRight className="w-6 h-6 text-border hidden md:block" />

                {/* Target Node */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:border-emerald-500/50 transition-all shadow-emerald-500/10">
                     <FileCheck className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Live Engine</p>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest pt-1">Target Engine</p>
                  </div>
                </div>

             </div>
             
             <div className="mt-4 flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest gap-2 relative z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                Pipeline actively streaming 1.4k req/sec
             </div>
          </div>

        </div>

        {/* Right Column: History & Reports */}
        <div className="space-y-6 lg:space-y-8">
          
          <div className="liquid-glass border border-white/10 rounded-[2rem] p-6 lg:p-8 shadow-2xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Upload History 
                </h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Validation Reports & Ingestion Logs</p>
              </div>
              <button className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {[
                { name: 'fleet_routes_v4.csv', status: 'Success', rows: '4,291', errors: 0, date: 'Today, 10:45 AM', type: 'fleet' },
                { name: 'zone_b_telemetry_historical.csv', status: 'Warning', rows: '12,050', errors: 42, date: 'Yesterday, 04:15 PM', type: 'sensor' },
                { name: 'q1_waste_generation_audit.csv', status: 'Failed', rows: '0', errors: 145, date: 'Mar 15, 2026', type: 'audit' },
                { name: 'bin_inventory_sync.csv', status: 'Success', rows: '840', errors: 0, date: 'Mar 14, 2026', type: 'inventory' }
              ].map((report, i) => (
                <div key={i} className="group p-4 rounded-2xl bg-card/40 border border-border/50 hover:border-white/10 hover:bg-card/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer">
                  
                  <div className="flex items-start sm:items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                      report.status === 'Success' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      report.status === 'Warning' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {report.status === 'Success' ? <ShieldCheck className="w-5 h-5" /> : 
                       report.status === 'Warning' ? <AlertCircle className="w-5 h-5" /> : 
                       <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{report.name}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{report.date}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-background/50 border border-border">
                          {report.rows} Rows
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                      report.status === 'Success' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                      report.status === 'Warning' ? "text-orange-500 border-orange-500/20 bg-orange-500/5" :
                      "text-red-500 border-red-500/20 bg-red-500/5"
                    )}>
                      {report.status}
                    </div>
                    {report.errors > 0 && (
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {report.errors} Validation Errors
                      </span>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center gap-2">
                     <button className="w-8 h-8 rounded-lg bg-background/80 backdrop-blur-md flex items-center justify-center border border-border hover:border-primary/50 hover:text-primary transition-all shadow-lg" title="Download Validation Report">
                       <Download className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-border/50">
               <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                 <Database className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                 <div>
                   <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Nightly Sync Active</p>
                   <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">All connected IoT hubs automatically dump unvalidated sensor telemetry into the staging schema at 03:00 UTC for morning ingestion.</p>
                 </div>
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
