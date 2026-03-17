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
}

export function StatCard({ label, value, unit, change, icon: Icon, iconColor = 'text-emerald-400', gradient = 'from-emerald-500/10 to-teal-500/5', className }: StatCardProps) {
  return (
    <div className={cn('relative overflow-hidden bg-card border border-border rounded-2xl p-5 hover:border-primary/20 transition-all duration-200 hover:bg-card/80 group', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300', gradient)} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</p>
          <div className={cn('p-2 rounded-xl bg-foreground/5', iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-bold text-foreground tracking-tight">{value}</span>
          {unit && <span className="text-muted-foreground text-sm mb-0.5">{unit}</span>}
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
  CRITICAL: 'bg-red-500/15 border-red-500/30 text-red-400',
  HIGH: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
  MEDIUM: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  LOW: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
};

export function AlertCard({ type, severity, message, time }: AlertCardProps) {
  return (
    <div className={cn('border rounded-xl p-3.5 flex items-start gap-3', SEVERITY_STYLES[severity])}>
      <div className={cn('w-2 h-2 rounded-full mt-1 flex-shrink-0', {
        'bg-red-400': severity === 'CRITICAL',
        'bg-orange-400': severity === 'HIGH',
        'bg-yellow-400': severity === 'MEDIUM',
        'bg-blue-400': severity === 'LOW',
      })} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{type}</p>
        <p className="text-xs opacity-70 mt-0.5 truncate">{message}</p>
        <p className="text-xs opacity-50 mt-1">{time}</p>
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
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
