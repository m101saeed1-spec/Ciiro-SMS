import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wifi, WifiOff, RefreshCw, X, AlertTriangle, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ConnectivityBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [showRestoredMessage, setShowRestoredMessage] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [offlineSince, setOfflineSince] = useState<Date | null>(null);

  const restoredTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check actual connectivity via ping
  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Use cache-busting fetch to verify actual round-trip network connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        if (!isOnline) {
          setIsOnline(true);
          setOfflineSince(null);
          setWasOffline(true);
          setShowRestoredMessage(true);
        }
      } else {
        setIsOnline(false);
      }
    } catch {
      // If health fetch fails, verify with navigator.onLine fallback
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setIsOnline(false);
      }
    } finally {
      setIsChecking(false);
    }
  }, [isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOfflineSince(null);
      if (wasOffline) {
        setShowRestoredMessage(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowRestoredMessage(false);
      setOfflineSince(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Auto-dismiss the "back online" message after 4 seconds
  useEffect(() => {
    if (showRestoredMessage) {
      if (restoredTimerRef.current) {
        clearTimeout(restoredTimerRef.current);
      }
      restoredTimerRef.current = setTimeout(() => {
        setShowRestoredMessage(false);
        setWasOffline(false);
      }, 4000);
    }

    return () => {
      if (restoredTimerRef.current) {
        clearTimeout(restoredTimerRef.current);
      }
    };
  }, [showRestoredMessage]);

  // If online and no restored notification, render nothing
  if (isOnline && !showRestoredMessage) {
    return null;
  }

  return (
    <div
      id="connectivity-status-wrapper"
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <AnimatePresence mode="wait">
        {/* Offline Banner */}
        {!isOnline && (
          <motion.div
            key="offline-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full flex justify-center pointer-events-auto shadow-md"
          >
            {isMinimized ? (
              // Minimized floating pill
              <div className="mt-2 mx-4 bg-rose-600 dark:bg-rose-700 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 border border-rose-400/30 text-xs font-semibold backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <WifiOff className="w-3.5 h-3.5" />
                <span>You are offline</span>
                <button
                  type="button"
                  onClick={() => setIsMinimized(false)}
                  className="p-1 hover:bg-rose-700/60 rounded-full transition-colors ml-1"
                  title="Expand offline details"
                  aria-label="Expand offline details"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // Full Expanded Banner
              <div className="w-full bg-rose-600 dark:bg-rose-800 text-white px-4 py-2.5 sm:py-3 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
                  {/* Left info */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-8 h-8 rounded-lg bg-rose-700 dark:bg-rose-900/80 flex items-center justify-center shrink-0 border border-rose-400/30">
                      <WifiOff className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white tracking-wide">
                          No Internet Connection Detected
                        </p>
                        <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-700/80 text-rose-100 border border-rose-400/30">
                          Offline Mode
                        </span>
                      </div>
                      <p className="text-rose-100/90 text-xs font-medium truncate sm:whitespace-normal">
                        You are browsing cached data. Changes will automatically sync when connection is restored.
                        {offlineSince && (
                          <span className="hidden lg:inline ml-1 text-rose-200/80">
                            (Disconnected at {offlineSince.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      id="retry-connection-btn"
                      onClick={checkConnection}
                      disabled={isChecking}
                      className="px-3 py-1.5 rounded-lg bg-white text-rose-700 dark:text-rose-800 hover:bg-rose-50 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-75 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                      <span>{isChecking ? 'Checking...' : 'Retry Connection'}</span>
                    </button>

                    <button
                      type="button"
                      id="minimize-connection-banner-btn"
                      onClick={() => setIsMinimized(true)}
                      className="p-1.5 hover:bg-rose-700/80 rounded-lg text-rose-100 hover:text-white transition-colors"
                      title="Minimize banner"
                      aria-label="Minimize banner"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Back Online Reconnected Banner */}
        {isOnline && showRestoredMessage && (
          <motion.div
            key="online-banner"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full bg-emerald-600 dark:bg-emerald-700 text-white px-4 py-2.5 sm:py-3 shadow-md pointer-events-auto transition-colors"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 dark:bg-emerald-800 flex items-center justify-center shrink-0 border border-emerald-400/30">
                  <Wifi className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    Connection Restored!
                  </p>
                  <p className="text-emerald-100 text-xs font-medium">
                    You are back online. All school management systems are synced.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="dismiss-online-banner-btn"
                onClick={() => setShowRestoredMessage(false)}
                className="p-1.5 hover:bg-emerald-700/80 rounded-lg text-emerald-100 hover:text-white transition-colors"
                title="Dismiss"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
