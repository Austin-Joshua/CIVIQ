'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { SectionHeader } from '@/components/ui/Cards';
import { ShieldAlert, RefreshCw, Ban, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ensureThreatNotifyPermission, notifyThreatDesktop } from '@/lib/security/threatDesktopNotify';
import { userFacingApiMessage, userFacingError } from '@/lib/userFacingMessage';

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'GOV_ADMIN']);

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : [];
}

interface SecurityEvent {
  id: string;
  userId?: string;
  ip: string;
  action: string;
  path: string;
  method: string;
  statusCode: number;
  severity: string;
  rule?: string;
  message?: string;
  timestamp: string;
}

interface SecurityBlock {
  id: string;
  type: string;
  value: string;
  reason: string;
  until: string;
  createdAt: string;
}

interface SecuritySettings {
  monitoringEnabled: boolean;
  envSecurityMonitorEnabled: boolean;
  detectionIntervalSec: number;
  maxRequestsPerIPPerMinute: number;
  telegramSecurityEnabled?: boolean;
  telegramBotReady?: boolean;
}

interface MLThreatAlert {
  id: string;
  severity: string;
  label: string;
  confidence: number;
  ip: string;
  userId?: string;
  path: string;
  method: string;
  signals?: Record<string, number>;
  message?: string;
  timestamp: string;
}

interface SecurityAttackLog {
  id: string;
  command: string;
  status: 'executed' | 'blocked' | 'recovery' | 'sync';
  message: string;
  telegramUser?: number;
  telegramChat?: string;
  affectedIds?: string[];
  timestamp: string;
}

interface TelegramStatus {
  enabled: boolean;
  hasToken: boolean;
  allowedUsersCount: number;
  pollIntervalSec: number;
  workerExpected: boolean;
  telegramApiReachable: boolean;
  botUsername?: string;
  message?: string;
}

export default function SecurityMonitorPage() {
  const router = useRouter();
  const { token, user, hasHydrated } = useAuthStore();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [blocks, setBlocks] = useState<SecurityBlock[]>([]);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'events' | 'blocks' | 'ml' | 'attacks'>('events');
  const [mlAlerts, setMlAlerts] = useState<MLThreatAlert[]>([]);
  const [attackLogs, setAttackLogs] = useState<SecurityAttackLog[]>([]);
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus | null>(null);
  const lastMlIdRef = useRef<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState('');
  const [manualType, setManualType] = useState<'ip' | 'user'>('ip');
  const [manualValue, setManualValue] = useState('');
  const [manualMinutes, setManualMinutes] = useState(60);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingTelegramSecurity, setSavingTelegramSecurity] = useState(false);
  const [runningRecovery, setRunningRecovery] = useState(false);
  const [runningAttackCmd, setRunningAttackCmd] = useState<string | null>(null);

  const canView = user?.role && ADMIN_ROLES.has(user.role);
  const canUnblock = user?.role === 'SUPER_ADMIN';
  const canControl = user?.role === 'SUPER_ADMIN';

  const effectiveMonitoring =
    settings?.envSecurityMonitorEnabled && settings?.monitoringEnabled;

  const load = useCallback(async () => {
    if (!token || !canView) return;
    setLoading(true);
    try {
      const base = getApiBaseUrl();
      const q = severityFilter ? `?severity=${encodeURIComponent(severityFilter)}&limit=200` : '?limit=200';
      const [evRes, blRes, stRes, mlRes, atkRes, tgRes] = await Promise.all([
        fetch(`${base}/security/events${q}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/security/blocks`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/security/settings`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/security/ml-alerts?limit=120`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/security/attack-logs?limit=120`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${base}/security/telegram-status`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (evRes.status === 403 || blRes.status === 403) {
        toast.error('Access not authorized', {
          description: 'Your account does not include security monitoring.',
        });
        router.replace('/dashboard');
        return;
      }
      if (!evRes.ok || !blRes.ok) throw new Error('fetch failed');
      setEvents(asArray<SecurityEvent>(await evRes.json()));
      setBlocks(asArray<SecurityBlock>(await blRes.json()));
      if (stRes.ok) {
        setSettings(await stRes.json());
      }
      if (mlRes.ok) {
        const rows = asArray<MLThreatAlert>(await mlRes.json());
        setMlAlerts(rows);
        const newest = rows[0];
        if (newest && newest.severity === 'critical' && lastMlIdRef.current && newest.id !== lastMlIdRef.current) {
          toast.error('Critical security signal', {
            description: `${newest.label}. Review the ML alerts tab for details.`,
          });
          notifyThreatDesktop('CIVIQ security alert', `${newest.label} (${newest.method})`);
        }
        if (newest) {
          lastMlIdRef.current = newest.id;
        }
      }
      if (atkRes.ok) {
        setAttackLogs(asArray<SecurityAttackLog>(await atkRes.json()));
      }
      if (tgRes.ok) {
        setTelegramStatus(await tgRes.json());
      }
    } catch (err) {
      toast.error(
        userFacingError(err, {
          fallback: 'Security data could not be refreshed. Please try again shortly.',
        })
      );
    } finally {
      setLoading(false);
    }
  }, [token, canView, severityFilter, router]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) {
      router.replace('/auth/login');
      return;
    }
    if (!canView) {
      router.replace('/dashboard');
      return;
    }
    load();
  }, [hasHydrated, token, canView, router, load]);

  useEffect(() => {
    if (!token || !canView) return;
    const t = setInterval(() => load(), 8000);
    return () => clearInterval(t);
  }, [token, canView, load]);

  const handleUnblock = async (id: string) => {
    if (!canUnblock || !token) return;
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/security/blocks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Restriction lifted', { description: 'The block has been removed.' });
      load();
    } catch {
      toast.error('The block could not be removed. Please try again.');
    }
  };

  const handleToggleMonitoring = async (next: boolean) => {
    if (!canControl || !token) return;
    setSavingSettings(true);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/security/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ monitoringEnabled: next }),
      });
      if (!res.ok) throw new Error();
      setSettings(await res.json());
      toast.success(next ? 'Monitoring is active' : 'Monitoring paused', {
        description: next
          ? 'Security events will continue to be recorded.'
          : 'Automated monitoring is temporarily suspended.',
      });
    } catch {
      toast.error('Monitoring settings could not be updated.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleTelegramSecurity = async (next: boolean) => {
    if (!canControl || !token) return;
    setSavingTelegramSecurity(true);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/security/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telegramSecurityEnabled: next }),
      });
      if (!res.ok) throw new Error();
      setSettings(await res.json());
      toast.success(next ? 'External notifications enabled' : 'External notifications disabled', {
        description: 'Telegram alert preferences have been saved.',
      });
    } catch {
      toast.error('Notification preferences could not be updated.');
    } finally {
      setSavingTelegramSecurity(false);
    }
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canControl || !token || !manualValue.trim()) return;
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/security/blocks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: manualType,
          value: manualValue.trim(),
          minutes: manualMinutes || 60,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(userFacingApiMessage(data?.message, 'This restriction could not be applied.'));
      if (Array.isArray(data.blocks)) setBlocks(data.blocks);
      toast.success('Restriction applied', { description: 'The block is now in effect.' });
      setManualValue('');
      load();
    } catch (err) {
      toast.error(userFacingError(err, { fallback: 'This restriction could not be applied.' }));
    }
  };

  const handleRunRecovery = async () => {
    if (!canControl || !token) return;
    setRunningRecovery(true);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/security/recovery/run`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(userFacingApiMessage(data?.message, 'Recovery could not be completed.'));
      toast.success('Recovery completed', {
        description: `Restored ${data.stats?.restored ?? 0}, cleaned ${data.stats?.cleaned ?? 0}, replaced ${
          data.stats?.replaced ?? 0
        }.`,
      });
      load();
    } catch (err) {
      toast.error(userFacingError(err, { fallback: 'Recovery could not be completed. Please try again later.' }));
    } finally {
      setRunningRecovery(false);
    }
  };

  const handleAttackTest = async (command: 'insert' | 'delete' | 'manipulate' | 'duplicate') => {
    if (!canControl || !token) return;
    setRunningAttackCmd(command);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/security/attack-test`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(userFacingApiMessage(data?.message, 'The security exercise could not be run.'));
      const okMsg = userFacingApiMessage(
        typeof data?.message === 'string' ? data.message : '',
        'Security validation step completed.'
      );
      toast.success('Security exercise completed', { description: okMsg });
      load();
    } catch (err) {
      toast.error(
        userFacingError(err, { fallback: 'The security exercise could not be completed. Please try again.' })
      );
    } finally {
      setRunningAttackCmd(null);
    }
  };

  if (!hasHydrated || !user) {
    return (
      <div className="text-sm text-muted-foreground p-6">Loading…</div>
    );
  }

  if (!canView) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      <SectionHeader
        title="Security monitoring"
        subtitle="Review security events, apply access restrictions, and manage automated detection settings."
        icon={ShieldAlert}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/50"
          onClick={() =>
            void ensureThreatNotifyPermission().then((p) =>
              toast.message('Desktop notifications', {
                description: p === 'granted' ? 'Alerts will appear on this workstation.' : `Status: ${p}`,
              })
            )
          }
        >
          Enable desktop notifications
        </button>
        <span className="text-[11px] text-muted-foreground self-center">
          Uses the browser notification service for high-priority security notices on this device.
        </span>
      </div>

      {settings && (
        <div className="rounded-xl border border-border liquid-glass p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Security mode</p>
              <p className="text-xs text-muted-foreground mt-1">
                Effective:{' '}
                <span className={effectiveMonitoring ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>
                  {effectiveMonitoring ? 'ON' : 'OFF'}
                </span>
                {settings.envSecurityMonitorEnabled === false && (
                  <span className="block mt-1">
                    Monitoring is turned off in the server environment. Contact your system administrator to enable it and
                    restart the application service.
                  </span>
                )}
                {settings.envSecurityMonitorEnabled && (
                  <span className="block mt-1 text-muted-foreground">
                    Detection runs about every {settings.detectionIntervalSec} seconds. Elevated traffic above{' '}
                    {settings.maxRequestsPerIPPerMinute} requests per minute per network address may trigger a review (server
                    policy).
                  </span>
                )}
                {telegramStatus && (
                  <span className="block mt-2">
                    Telegram bot:{' '}
                    <span className={telegramStatus.telegramApiReachable ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>
                      {telegramStatus.telegramApiReachable ? 'reachable' : 'not ready'}
                    </span>
                    {telegramStatus.botUsername ? ` (@${telegramStatus.botUsername})` : ''} · allowed users:{' '}
                    {telegramStatus.allowedUsersCount}
                    {telegramStatus.message ? <span className="block mt-1">{telegramStatus.message}</span> : null}
                  </span>
                )}
                {settings.telegramSecurityEnabled !== undefined && (
                  <span className="block mt-2">
                    Telegram command security:{' '}
                    <span className={settings.telegramSecurityEnabled ? 'text-emerald-500 font-medium' : 'text-amber-500 font-medium'}>
                      {settings.telegramSecurityEnabled ? 'ON' : 'OFF'}
                    </span>
                  </span>
                )}
              </p>
            </div>
            {canControl && settings.envSecurityMonitorEnabled && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={() => handleToggleMonitoring(!settings.monitoringEnabled)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    settings.monitoringEnabled
                      ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
                      : 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25'
                  )}
                >
                  {savingSettings ? 'Saving…' : settings.monitoringEnabled ? 'Turn monitoring OFF' : 'Turn monitoring ON'}
                </button>
                <button
                  type="button"
                  disabled={savingTelegramSecurity || settings.telegramBotReady === false}
                  onClick={() => handleToggleTelegramSecurity(!(settings.telegramSecurityEnabled ?? true))}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    (settings.telegramSecurityEnabled ?? true)
                      ? 'bg-primary/15 text-primary hover:bg-primary/25'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25'
                  )}
                >
                  {savingTelegramSecurity
                    ? 'Saving…'
                    : (settings.telegramSecurityEnabled ?? true)
                      ? 'Turn Telegram security OFF'
                      : 'Turn Telegram security ON'}
                </button>
              </div>
            )}
          </div>

          {canControl && (
            <form onSubmit={handleManualBlock} className="flex flex-wrap items-end gap-3 pt-2 border-t border-border">
              <p className="w-full text-xs font-medium text-foreground">Manual action (immediate)</p>
              <div>
                <label className="text-[10px] uppercase text-muted-foreground block mb-1">Type</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as 'ip' | 'user')}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="ip">Block IP</option>
                  <option value="user">Restrict user</option>
                </select>
              </div>
              <div className="flex-1 min-w-[160px]">
                <label className="text-[10px] uppercase text-muted-foreground block mb-1">IP or user ID</label>
                <input
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  placeholder={manualType === 'ip' ? '203.0.113.10' : 'user document id'}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div className="w-24">
                <label className="text-[10px] uppercase text-muted-foreground block mb-1">Minutes</label>
                <input
                  type="number"
                  min={1}
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleRunRecovery}
                disabled={runningRecovery}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 text-sm font-medium hover:bg-amber-500/30 disabled:opacity-60"
              >
                {runningRecovery ? 'Recovering…' : 'Run Backup Recovery'}
              </button>
              <div className="w-full pt-2 border-t border-border/70 mt-1 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground w-full">
                  Controlled validation (sandbox, for testing only)
                </span>
                {(['insert', 'delete', 'manipulate', 'duplicate'] as const).map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleAttackTest(cmd)}
                    disabled={runningAttackCmd !== null}
                    className="px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 disabled:opacity-60"
                  >
                    {runningAttackCmd === cmd ? `Running ${cmd}…` : `Run ${cmd}`}
                  </button>
                ))}
              </div>
            </form>
          )}
        </div>
      )}

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm space-y-2">
        <p className="font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Administrator reference — training exercise
        </p>
        <ol className="list-decimal list-inside text-muted-foreground space-y-1.5">
          <li>
            Obtain a session token from your signed-in browser session (developer tools: application storage or an authorized
            request header). Do not share tokens outside approved testing.
          </li>
          <li>
            Optional scripted exercise: run the repository demo script with your token to generate controlled traffic for rule
            testing. See the project <code className="text-xs bg-muted px-1 rounded">scripts</code> folder for the approved
            command-line example.
          </li>
          <li>
            Keep this page on <strong>Event log</strong>. If external alerting is configured, confirm notifications on the
            approved device when a rule is triggered.
          </li>
          <li>
            <strong>Recovery:</strong> active restrictions appear under <strong>Blocked IPs &amp; users</strong>. A super
            administrator may lift a block, or you may wait until the restriction period ends and refresh this page.
          </li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setTab('events')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            tab === 'events' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          Event log
        </button>
        <button
          type="button"
          onClick={() => setTab('blocks')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            tab === 'blocks' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          <Ban className="w-4 h-4" />
          Blocked IPs &amp; users
          {blocks.length > 0 && (
            <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">{blocks.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('ml')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            tab === 'ml' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          <ShieldAlert className="w-4 h-4" />
          ML threat feed
          {mlAlerts.length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded">
              {mlAlerts.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('attacks')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            tab === 'attacks' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted/50'
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Audit log
          {attackLogs.length > 0 && (
            <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">{attackLogs.length}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => load()}
          className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted/50"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {tab === 'events' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Severity</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
            >
              <option value="">All</option>
              <option value="info">info</option>
              <option value="critical">critical</option>
            </select>
          </div>
          <div className="rounded-xl border border-border overflow-hidden liquid-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Time</th>
                    <th className="p-3 font-medium">Severity</th>
                    <th className="p-3 font-medium">User</th>
                    <th className="p-3 font-medium">IP</th>
                    <th className="p-3 font-medium">Action</th>
                    <th className="p-3 font-medium">Path</th>
                    <th className="p-3 font-medium">Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Loading events…
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No events yet.
                      </td>
                    </tr>
                  ) : (
                    events.map((e) => (
                      <tr key={e.id} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(e.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          {e.severity === 'critical' ? (
                            <span className="inline-flex items-center gap-1 text-destructive text-xs font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              critical
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">info</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs">{e.userId || '—'}</td>
                        <td className="p-3 font-mono text-xs">{e.ip}</td>
                        <td className="p-3">
                          <span className="text-xs">{e.action}</span>
                          <span className="text-muted-foreground text-xs ml-1">{e.method}</span>
                        </td>
                        <td className="p-3 max-w-[220px] truncate text-xs" title={e.path}>
                          {e.path}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{e.rule || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'ml' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Real-time pipeline: Go gateway batches traffic to the Python ML service (Phases A–C). High-confidence malicious
            flows also appear in the main event log and can trigger Telegram when configured.
          </p>
          <div className="rounded-xl border border-border overflow-hidden liquid-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Time</th>
                    <th className="p-3 font-medium">Severity</th>
                    <th className="p-3 font-medium">Label</th>
                    <th className="p-3 font-medium">Confidence</th>
                    <th className="p-3 font-medium">IP</th>
                    <th className="p-3 font-medium">Request</th>
                    <th className="p-3 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        Loading…
                      </td>
                    </tr>
                  ) : mlAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No ML alerts yet. Set <code className="text-xs bg-muted px-1 rounded">SECURITY_ML_BASE_URL</code> on the
                        API and run the ai-services stack.
                      </td>
                    </tr>
                  ) : (
                    mlAlerts.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 text-xs font-medium">
                          {a.severity === 'critical' ? (
                            <span className="text-destructive">critical</span>
                          ) : (
                            <span className="text-muted-foreground">info</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-xs">{a.label}</td>
                        <td className="p-3 text-xs">{(a.confidence * 100).toFixed(1)}%</td>
                        <td className="p-3 font-mono text-xs">{a.ip}</td>
                        <td className="p-3 text-xs max-w-[200px] truncate" title={`${a.method} ${a.path}`}>
                          {a.method} {a.path}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[220px] truncate">{a.message || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'attacks' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Telegram commands (/insert, /delete, /manipulate, /duplicate), blocked threats, backup sync, and recovery actions.
          </p>
          <div className="rounded-xl border border-border overflow-hidden liquid-glass">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Time</th>
                    <th className="p-3 font-medium">Command</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Telegram User</th>
                    <th className="p-3 font-medium">Affected IDs</th>
                    <th className="p-3 font-medium">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Loading…
                      </td>
                    </tr>
                  ) : attackLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No audit entries yet.
                      </td>
                    </tr>
                  ) : (
                    attackLogs.map((a) => (
                      <tr key={a.id} className="border-b border-border/60 hover:bg-muted/30">
                        <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                          {new Date(a.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-mono text-xs">{a.command}</td>
                        <td className="p-3 text-xs">
                          <span
                            className={cn(
                              'font-medium',
                              a.status === 'blocked' && 'text-amber-600 dark:text-amber-400',
                              a.status === 'executed' && 'text-destructive',
                              a.status === 'recovery' && 'text-emerald-600 dark:text-emerald-400',
                              a.status === 'sync' && 'text-primary'
                            )}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs">{a.telegramUser ?? '—'}</td>
                        <td className="p-3 text-xs">{a.affectedIds?.length ? a.affectedIds.slice(0, 2).join(', ') : '—'}</td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[280px] truncate" title={a.message}>
                          {a.message}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'blocks' && (
        <div className="rounded-xl border border-border overflow-hidden liquid-glass">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Value</th>
                  <th className="p-3 font-medium">Reason</th>
                  <th className="p-3 font-medium">Until</th>
                  {canUnblock && <th className="p-3 font-medium w-28">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={canUnblock ? 5 : 4} className="p-8 text-center text-muted-foreground">
                      Loading…
                    </td>
                  </tr>
                ) : blocks.length === 0 ? (
                  <tr>
                    <td colSpan={canUnblock ? 5 : 4} className="p-8 text-center text-muted-foreground">
                      No active blocks.
                    </td>
                  </tr>
                ) : (
                  blocks.map((b) => (
                    <tr key={b.id} className="border-b border-border/60">
                      <td className="p-3 font-medium">{b.type}</td>
                      <td className="p-3 font-mono text-xs break-all">{b.value}</td>
                      <td className="p-3 text-xs">{b.reason}</td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {new Date(b.until).toLocaleString()}
                      </td>
                      {canUnblock && (
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleUnblock(b.id)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Unblock
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!canUnblock && (
            <p className="p-4 text-xs text-muted-foreground border-t border-border">
              Only a super admin can remove blocks.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
