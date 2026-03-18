'use client';

import { useState } from 'react';
import { Database, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, HardDrive } from 'lucide-react';
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
    <div className="space-y-8">
      <SectionHeader title="Data Integration & Management" subtitle="Import external datasets, manage system backups, and run mock data generators." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bulk Import Zone */}
        <div className="bg-card/50 border border-border rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Bulk Data Import</h3>
              <p className="text-xs text-muted-foreground">Upload CSV files for historical bin data, route logs, or zone definitions.</p>
            </div>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer group relative overflow-hidden",
              isDragging ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:border-primary/30 hover:bg-muted/30"
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
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm font-bold text-foreground tracking-widest uppercase">Processing Dataset...</p>
                <p className="text-xs text-primary">Validating columns and mapping schema</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-emerald-500 dark:text-emerald-400">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">Drag & Drop CSV File</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Supported schemas: `historical_generation`, `fleet_logs`, `sensor_telemetry`. Max file size: 50MB.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Database Status & Utilities */}
        <div className="space-y-6">
          <div className="bg-card/50 border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-teal-500 dark:text-teal-400" />
                <h3 className="text-lg font-bold text-foreground">Database Integrity</h3>
              </div>
              <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold uppercase rounded-md flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Healthy
              </span>
            </div>

            <div className="space-y-4">
               <div className="flex justify-between items-center p-4 bg-card border border-border rounded-xl">
                 <div className="flex items-center gap-3">
                   <HardDrive className="w-4 h-4 text-muted-foreground" />
                   <div>
                     <p className="text-xs font-bold text-foreground">Storage Utilization</p>
                     <p className="text-[10px] text-muted-foreground mt-0.5">2.4 GB / 50.0 GB</p>
                   </div>
                 </div>
                 <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                   <div className="w-[5%] h-full bg-teal-500" />
                 </div>
               </div>

               <div className="flex justify-between items-center p-4 bg-card border border-border rounded-xl">
                 <div className="flex items-center gap-3">
                   <AlertCircle className="w-4 h-4 text-muted-foreground" />
                   <div>
                     <p className="text-xs font-bold text-foreground">Last Automated Backup</p>
                     <p className="text-[10px] text-muted-foreground mt-0.5">Today, 03:00 AM (UTC)</p>
                   </div>
                 </div>
                 <button className="text-[10px] font-bold text-foreground hover:text-primary uppercase tracking-widest transition-colors">
                   View Logs
                 </button>
               </div>
            </div>
          </div>

          <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6">
            <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 mb-2">Mock Data Generator</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Synthesize 30 days of standard telemetry data across all active zones for simulation purposes. This will overwrite existing simulations.
            </p>
            <button 
              onClick={() => {
                setIsUploading(true);
                setTimeout(() => {
                  setIsUploading(false);
                  toast({
                    title: "Mock Data Generated",
                    description: "Simulation telemetry for 42 zones has been synthesized.",
                    type: "success"
                  });
                }, 2000);
              }}
              disabled={isUploading}
              className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-orange-500/30 disabled:opacity-50"
            >
              {isUploading ? 'Generating...' : 'Run Generator Script'}
            </button>
          </div>

          <div className="bg-card/50 border border-border rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Data Exports</h3>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Monthly Sustainability Report', date: 'Mar 15, 2024', size: '1.2 MB' },
                { name: 'Fleet Performance Audit', date: 'Mar 12, 2024', size: '850 KB' },
                { name: 'Zone C Telemetry Export', date: 'Mar 10, 2024', size: '4.5 MB' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-background/50 border border-border rounded-xl group hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.date} • {item.size}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast({ title: 'Export Started', description: `Downloading ${item.name}...`, type: 'success' })}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
