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

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'GOV_ADMIN']);

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
        toast.error('You do not have access to security monitoring.');
        router.replace('/dashboard');
        return;
      }
      if (!evRes.ok || !blRes.ok) throw new Error('fetch failed');
      setEvents(await evRes.json());
      setBlocks(await blRes.json());
      if (stRes.ok) {
        setSettings(await stRes.json());
      }
      if (mlRes.ok) {
        const rows: MLThreatAlert[] = await mlRes.json();
        setMlAlerts(rows);
        const newest = rows[0];
        if (newest && newest.severity === 'critical' && lastMlIdRef.current && newest.id !== lastMlIdRef.current) {
          toast.error(`ML threat: ${newest.label} (${newest.path})`);
          notifyThreatDesktop('CIVIQ security alert', `${newest.label} · ${newest.method} ${newest.path}`);
        }
        if (newest) {
          lastMlIdRef.current = newest.id;
        }
      }
      if (atkRes.ok) {
        setAttackLogs(await atkRes.json());
      }
      if (tgRes.ok) {
        setTelegramStatus(await tgRes.json());
      }
    } catch {
      toast.error('Could not load security data.');
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
      toast.success('Block removed.');
      load();
    } catch {
      toast.error('Could not remove block.');
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
      toast.success(next ? 'Security monitoring enabled' : 'Security monitoring paused');
    } catch {
      toast.error('Could not update monitoring mode.');
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
      toast.success(next ? 'Telegram security enabled' : 'Telegram security disabled');
    } catch {
      toast.error('Could not update Telegram security mode.');
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
      if (!res.ok) throw new Error(data.message || 'failed');
      if (data.blocks) setBlocks(data.blocks);
      toast.success('Block applied immediately.');
      setManualValue('');
      load();
    } catch {
      toast.error('Could not apply block.');
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
      if (!res.ok) throw new Error(data.message || 'failed');
      toast.success(
        `Recovery complete: restored ${data.stats?.restored ?? 0}, cleaned ${data.stats?.cleaned ?? 0}, replaced ${
          data.stats?.replaced ?? 0
        }`
      );
      load();
    } catch {
      toast.error('Recovery run failed.');
    } finally {
      setRunningRecovery(false);
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
        title="Security monitor"
        subtitle="Controllable monitoring, ML traffic intelligence (async batched), Telegram alerts, and blocks."
        icon={ShieldAlert}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-muted/50"
          onClick={() => void ensureThreatNotifyPermission().then((p) => toast.message(`Notifications: ${p}`))}
        >
          Enable desktop threat notifications
        </button>
        <span className="text-[11px] text-muted-foreground self-center">
          Firebase FCM can target the same channel via a registered service worker; this build uses the Web Notifications API.
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
                    Server env <code className="text-[10px] bg-muted px-1 rounded">SECURITY_MONITOR_ENABLED</code> is false — set
                    it true and restart the API to allow monitoring.
                  </span>
                )}
                {settings.envSecurityMonitorEnabled && (
                  <span className="block mt-1 text-muted-foreground">
                    Detection sweep every {settings.detectionIntervalSec}s · excessive traffic &gt;{' '}
                    {settings.maxRequestsPerIPPerMinute} req/min per IP (configurable on server).
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
            </form>
          )}
        </div>
      )}

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm space-y-2">
        <p className="font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Presenter demo (internal attack, not password guessing)
        </p>
        <ol className="list-decimal list-inside text-muted-foreground space-y-1.5">
          <li>
            Copy a JWT from your logged-in session (browser DevTools → Application → local storage for the auth store, or Network tab → any{' '}
            <code className="text-xs bg-muted px-1 rounded">/api</code> request → Authorization header).
          </li>
          <li>
            From the repo, run:{' '}
            <code className="text-xs bg-muted px-1 rounded break-all">
              $env:CIVIQ_DEMO_TOKEN=&quot;…jwt…&quot;; .\scripts\demo-internal-security-attack.ps1 -Mode MutatingFlood
            </code>
            <br />
            <span className="text-xs">
              (Uses 22 fast PATCH calls to <code className="bg-muted px-1 rounded">/api/users/me</code> — simulates API abuse with a valid token. For
              admin-route spam demo, use <code className="bg-muted px-1 rounded">-Mode ForbiddenFlood</code> with a <strong>VIEWER</strong> token.)
            </span>
          </li>
          <li>
            Keep this page open on <strong>Event log</strong>; open Telegram on your phone. You should see <strong>critical</strong> rows and a Telegram
            alert when a rule fires.
          </li>
          <li>
            <strong>Recovery:</strong> blocked user or IP appears under <strong>Blocked IPs &amp; users</strong> — a super admin can <strong>Unblock</strong>,
            or wait until the block window in server config expires, then refresh the app.
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
          Attack logs
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
                        No attack/recovery logs yet.
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
