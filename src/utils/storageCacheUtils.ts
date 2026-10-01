/**
 * Storage Cache Analysis and Diagnostics Utility
 * Evaluates localStorage and navigator.storage availability, estimates consumption,
 * and handles safe offline cache pruning to prevent QuotaExceededError during offline sessions.
 */

export interface StorageCacheStatus {
  usedBytes: number;
  totalEstimatedBytes: number;
  usagePercent: number;
  isLimited: boolean; // true if usage >= threshold or quota restricted
  cacheHealth: 'healthy' | 'warning' | 'critical';
  itemCount: number;
  categoryBreakdown: {
    name: string;
    key: string;
    bytes: number;
    formattedSize: string;
    itemCount?: number;
  }[];
  pendingSyncCount: number;
  lastChecked: Date;
  storageAvailable: boolean;
  quotaWarningThreshold: number; // e.g. 75%
}

const DEFAULT_LOCAL_STORAGE_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB typical browser quota
const WARNING_THRESHOLD_PERCENT = 75;
const CRITICAL_THRESHOLD_PERCENT = 90;

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculates accurate UTF-16 byte usage of localStorage keys and values
 */
export function analyzeLocalStorage(): StorageCacheStatus {
  let usedBytes = 0;
  let itemCount = 0;
  let storageAvailable = true;
  const categories: StorageCacheStatus['categoryBreakdown'] = [];

  if (typeof window === 'undefined' || !window.localStorage) {
    return {
      usedBytes: 0,
      totalEstimatedBytes: DEFAULT_LOCAL_STORAGE_LIMIT_BYTES,
      usagePercent: 0,
      isLimited: false,
      cacheHealth: 'healthy',
      itemCount: 0,
      categoryBreakdown: [],
      pendingSyncCount: 0,
      lastChecked: new Date(),
      storageAvailable: false,
      quotaWarningThreshold: WARNING_THRESHOLD_PERCENT,
    };
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const val = localStorage.getItem(key) || '';
        // UTF-16 characters = 2 bytes per char
        const keyBytes = key.length * 2;
        const valBytes = val.length * 2;
        const itemTotalBytes = keyBytes + valBytes;
        usedBytes += itemTotalBytes;
        itemCount++;

        let parsedCount: number | undefined = undefined;
        try {
          if (val.startsWith('[') || val.startsWith('{')) {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              parsedCount = parsed.length;
            }
          }
        } catch {
          // ignore
        }

        // Categorize known school app keys
        let friendlyName = key;
        if (key.includes('audit_logs')) friendlyName = 'Audit Activity Logs';
        else if (key.includes('theme')) friendlyName = 'Theme & Display Config';
        else if (key.includes('auth') || key.includes('user')) friendlyName = 'User Authentication Session';
        else if (key.includes('school')) friendlyName = 'Tenant School Data';
        else if (key.includes('cache_simulated')) friendlyName = 'Simulated Storage Buffer';

        categories.push({
          name: friendlyName,
          key,
          bytes: itemTotalBytes,
          formattedSize: formatBytes(itemTotalBytes),
          itemCount: parsedCount,
        });
      }
    }
  } catch {
    storageAvailable = false;
  }

  // Check pending offline audit log sync count
  let pendingSyncCount = 0;
  try {
    const logsRaw = localStorage.getItem('eduspike_audit_logs');
    if (logsRaw) {
      const logs = JSON.parse(logsRaw);
      if (Array.isArray(logs)) {
        pendingSyncCount = logs.length;
      }
    }
  } catch {
    pendingSyncCount = 0;
  }

  // Calculate percentage
  const totalEstimatedBytes = DEFAULT_LOCAL_STORAGE_LIMIT_BYTES;
  const usagePercent = Math.min(100, Math.round((usedBytes / totalEstimatedBytes) * 100));

  let cacheHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
  let isLimited = false;

  if (usagePercent >= CRITICAL_THRESHOLD_PERCENT || !storageAvailable) {
    cacheHealth = 'critical';
    isLimited = true;
  } else if (usagePercent >= WARNING_THRESHOLD_PERCENT) {
    cacheHealth = 'warning';
    isLimited = true;
  }

  return {
    usedBytes,
    totalEstimatedBytes,
    usagePercent,
    isLimited,
    cacheHealth,
    itemCount,
    categoryBreakdown: categories.sort((a, b) => b.bytes - a.bytes),
    pendingSyncCount,
    lastChecked: new Date(),
    storageAvailable,
    quotaWarningThreshold: WARNING_THRESHOLD_PERCENT,
  };
}

/**
 * Safely prunes non-critical cache and trims large audit log buffers
 * to reclaim critical localStorage quota without breaking application state.
 */
export function optimizeAndFreeCache(): { freedBytes: number; success: boolean } {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { freedBytes: 0, success: false };
  }

  const initialUsage = analyzeLocalStorage().usedBytes;

  try {
    // 1. Remove simulated buffer if any
    localStorage.removeItem('eduspike_cache_simulated_buffer');

    // 2. Trim audit logs to 30 most recent items instead of 200-500
    const logsRaw = localStorage.getItem('eduspike_audit_logs');
    if (logsRaw) {
      try {
        const logs = JSON.parse(logsRaw);
        if (Array.isArray(logs) && logs.length > 30) {
          const trimmed = logs.slice(0, 30);
          localStorage.setItem('eduspike_audit_logs', JSON.stringify(trimmed));
        }
      } catch {
        // ignore
      }
    }

    // 3. Clean up any transient temporary keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('tmp_') || key.includes('temp_') || key.includes('search_cache_'))) {
        localStorage.removeItem(key);
      }
    }

    const newUsage = analyzeLocalStorage().usedBytes;
    const freedBytes = Math.max(0, initialUsage - newUsage);
    return { freedBytes, success: true };
  } catch (err) {
    console.error('Error optimizing cache storage:', err);
    return { freedBytes: 0, success: false };
  }
}

/**
 * Helper to populate a harmless simulated buffer in localStorage
 * to test and preview the limited storage cache UI state.
 */
export function setSimulatedStorageConstraint(enable: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (enable) {
    // Create ~4.1 MB string to simulate 82% storage quota consumption
    const chunkSize = 1024; // 1 KB
    const pattern = 'A'.repeat(chunkSize);
    const targetKB = 4100; // ~4.1 MB
    let buffer = '';
    for (let i = 0; i < targetKB; i++) {
      buffer += pattern;
    }
    try {
      localStorage.setItem('eduspike_cache_simulated_buffer', buffer);
    } catch {
      // If quota exceeded, store as much as safely possible
      try {
        localStorage.setItem('eduspike_cache_simulated_buffer', 'A'.repeat(1024 * 1000));
      } catch {}
    }
  } else {
    localStorage.removeItem('eduspike_cache_simulated_buffer');
  }
}
