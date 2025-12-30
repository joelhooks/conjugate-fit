"use client";

import { useEffect, useState } from "react";
import WeightCalculatorHome from "@/components/weight-calculator-home";
import { useSetIsLoading, useIsLoading } from "@/lib/stores/ui-store";
import { enablePersistence } from "@/lib/stores/persistence";
import ErrorBoundary from "@/components/error-boundary";
import {
  clearAllAppData,
  injectRecoveryScript,
  enableRecoveryMode,
  handleServiceWorkerIssues,
} from "@/lib/recovery-utils";
import DebugPanel from "@/components/debug-panel";
import PersistenceDebugButton from "@/components/persistence-debug-button";
import { errorTracker, ErrorCategory } from "@/lib/error-tracking";
import MemphisLoaderScreen from "@/components/memphis-loader-screen";

export default function HomePage() {
  const setIsLoading = useSetIsLoading();
  const isLoading = useIsLoading();
  const [mounted, setMounted] = useState(false);
  const [showLoader, setShowLoader] = useState(true); // Simplified loading state
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [swIssueDetected, setSwIssueDetected] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    try {
      // Inject recovery script as early as possible
      injectRecoveryScript();

      // Mark component as mounted
      setMounted(true);

      // Log page load for debugging
      errorTracker.debug(ErrorCategory.COMPONENT, "HomePage mounted", {
        component: "HomePage",
        action: "mount",
      });

      // Check for service worker issues
      const lastError = localStorage.getItem("conjugate-fitness-last-error");
      const lastErrorTime = localStorage.getItem(
        "conjugate-fitness-last-error-time",
      );

      // If there was an error in the last 5 minutes, assume it might be a service worker issue
      if (lastError && lastErrorTime) {
        const errorTime = Number.parseInt(lastErrorTime, 10);
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;

        if (errorTime > fiveMinutesAgo) {
          setSwIssueDetected(true);
          errorTracker.warning(
            ErrorCategory.PERSISTENCE,
            "Recent error detected, might be service worker issue",
            {
              component: "HomePage",
              action: "checkForSwIssues",
              message: "Recent error detected, might be service worker issue",
              state: {
                lastError,
                errorTime: new Date(errorTime).toISOString(),
              },
            },
          );
        }
      }

      // Try to enable persistence right away
      const success = enablePersistence();
      setPersistenceEnabled(success);

      if (!success && !recoveryAttempted) {
        errorTracker.warning(ErrorCategory.PERSISTENCE, "Persistence failed", {
          component: "HomePage",
          action: "enablePersistence",
        });

        console.log("Persistence failed, attempting recovery...");
        enableRecoveryMode();
        clearAllAppData();
        setRecoveryAttempted(true);
        // Force reload after clearing data
        window.location.reload();
      }

      // Set a timeout to hide the loader after a minimum time
      // This ensures the loader is shown for at least this duration
      setTimeout(() => {
        setShowLoader(false);
      }, 2000);

      return () => {}; // Empty cleanup function
    } catch (err) {
      errorTracker.trackError(ErrorCategory.COMPONENT, err as Error, {
        component: "HomePage",
        action: "useEffect",
        message: "Error in HomePage useEffect",
      });

      console.error("Error in HomePage useEffect:", err);
      setShowLoader(false);

      if (!recoveryAttempted) {
        console.log("Error in initialization, attempting recovery...");
        enableRecoveryMode();
        clearAllAppData();
        setRecoveryAttempted(true);
        // Force reload after clearing data
        window.location.reload();
      }
    }
  }, [setIsLoading, recoveryAttempted]);

  // Determine if we're in development mode
  useEffect(() => {
    if (mounted) {
      setIsDevelopment(process.env.NODE_ENV === "development");
    }
  }, [mounted]);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleFixServiceWorker = async () => {
    try {
      setShowLoader(true);

      // Handle service worker issues
      await handleServiceWorkerIssues();

      // Clear localStorage
      clearAllAppData();

      // Clear error tracking
      localStorage.removeItem("conjugate-fitness-last-error");
      localStorage.removeItem("conjugate-fitness-last-error-time");

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Failed to fix service worker issues:", error);
      setShowLoader(false);
      alert(
        "Failed to fix service worker issues. Please try refreshing the page manually.",
      );
    }
  };

  const errorFallback = (
    <div className="flex flex-col min-h-screen bg-black text-white p-4 memphis-bg">
      <h1 className="text-5xl md:text-7xl mb-6 pb-2 logo-text">
        <span className="text-[hsl(var(--primary))] relative inline-block">
          <span className="relative z-10">CONJUGATE</span>
          <span className="absolute -left-1 -top-1 text-black opacity-20 z-0">
            CONJUGATE
          </span>
        </span>
        <br />
        <span className="text-outline">FITNESS</span>
      </h1>

      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-4 text-[hsl(var(--primary))]">
            Something went wrong
          </h2>
          <p>We encountered an error while loading the application.</p>
          <button
            onClick={() => {
              clearAllAppData();
              handleServiceWorkerIssues().then(() => {
                window.location.reload();
              });
            }}
            className="mt-4 bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md"
          >
            Reset App Data & Refresh
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      {/* Memphis Loader Screen - simplified logic */}
      <MemphisLoaderScreen isLoading={showLoader} minDuration={1500} />

      <div className="flex flex-col min-h-screen bg-black text-white p-4 memphis-bg">
        <h1 className="text-5xl md:text-7xl mb-6 pb-2 logo-text">
          <span className="text-[hsl(var(--primary))] relative inline-block">
            <span className="relative z-10">CONJUGATE</span>
            <span className="absolute -left-1 -top-1 text-black opacity-20 z-0">
              CONJUGATE
            </span>
          </span>
          <br />
          <span className="text-outline">FITNESS</span>
        </h1>

        {swIssueDetected && (
          <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6">
            <h2 className="text-lg font-bold mb-2">
              Service Worker Issue Detected
            </h2>
            <p className="mb-4">
              We detected a recent error that might be caused by an outdated
              service worker. This can happen when the app is updated but your
              browser is still using a cached version.
            </p>
            <button
              onClick={handleFixServiceWorker}
              className="bg-white text-yellow-600 px-4 py-2 rounded-md font-bold"
            >
              Fix & Reload
            </button>
          </div>
        )}

        <div className="flex-1">
          <div className="w-full max-w-md mx-auto">
            {/* Calculator is the main focus */}
            <WeightCalculatorHome />

            <div className="mt-8 pt-4">
              <div className="memphis-divider"></div>
              {!persistenceEnabled && (
                <p className="text-yellow-500 text-center text-sm">
                  Local storage is disabled. Data won't persist between
                  sessions.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Debug Panel - only shown in development */}
        {isDevelopment && <DebugPanel />}

        {/* Persistence Debug Button - only shown in development */}
        {isDevelopment && <PersistenceDebugButton />}
      </div>
    </ErrorBoundary>
  );
}
