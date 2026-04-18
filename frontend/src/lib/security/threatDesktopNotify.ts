'use client';

/**
 * Desktop threat notifications (Web Notifications API).
 * Firebase Cloud Messaging can subscribe the same browser channel by registering
 * a service worker and forwarding FCM payloads into this helper.
 */
export async function ensureThreatNotifyPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

export function notifyThreatDesktop(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, tag: 'civiq-ml-threat', requireInteraction: false });
  } catch {
    // ignore
  }
}
