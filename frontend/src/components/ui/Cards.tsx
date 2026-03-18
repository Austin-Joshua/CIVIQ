import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: { value: string; positive: boolean };
  icon: LucideIcon;
  iconColor?: string;
  gradient?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, unit, change, icon: Icon, iconColor = 'text-emerald-400', gradient = 'from-emerald-500/10 to-teal-500/5', className, onClick }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn('relative overflow-hidden bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-all duration-200 hover:bg-card/80 group', onClick && 'cursor-pointer hover:shadow-lg', className)}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', gradient)} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
          <div className={cn('p-2 rounded-xl bg-foreground/5', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-foreground tracking-tighter">{value}</span>
          {unit && <span className="text-muted-foreground text-sm font-bold mb-1">{unit}</span>}
        </div>
        {change && (
          <p className={cn('text-xs mt-2 font-medium', change.positive ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400')}>
            {change.positive ? '↑' : '↓'} {change.value} from last week
          </p>
        )}
      </div>
    </div>
  );
}

interface AlertCardProps {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  time: string;
}

const SEVERITY_STYLES = {
  CRITICAL: 'bg-red-500/10 dark:bg-red-500/15 border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400',
  HIGH: 'bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/20 dark:border-orange-500/30 text-orange-600 dark:text-orange-400',
  MEDIUM: 'bg-yellow-500/10 dark:bg-yellow-500/15 border-yellow-500/20 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
  LOW: 'bg-blue-500/10 dark:bg-blue-500/15 border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400',
};

export function AlertCard({ type, severity, message, time }: AlertCardProps) {
  return (
    <div className={cn('border rounded-xl p-3.5 flex items-start gap-3', SEVERITY_STYLES[severity])}>
      <div className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0', {
        'bg-red-500 dark:bg-red-400': severity === 'CRITICAL',
        'bg-orange-500 dark:bg-orange-400': severity === 'HIGH',
        'bg-yellow-500 dark:bg-yellow-400': severity === 'MEDIUM',
        'bg-blue-500 dark:bg-blue-400': severity === 'LOW',
      })} />
      <div className="flex-1 min-w-0">
        <p className="font-black text-sm uppercase tracking-tight">{type}</p>
        <p className="text-xs font-medium opacity-80 mt-0.5">{message}</p>
        <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest">{time}</p>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-black tracking-tighter text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-xs font-medium mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

import { X, Download, FileText } from 'lucide-react';

interface ReportSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ReportSidePanel({ isOpen, onClose, title, subtitle, children }: ReportSidePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Side Panel */}
      <div className="relative w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 border border-border rounded-lg text-xs font-semibold text-foreground transition-all">
              <Download className="w-3.5 h-3.5" /> Export PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 ml-2 rounded-lg text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
