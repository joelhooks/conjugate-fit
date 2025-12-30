"use client";

import { useEffect, useState } from "react";
import WeightCalculatorHome from "@/components/weight-calculator-home";
import { enablePersistence } from "@/lib/stores/persistence";
import ErrorBoundary from "@/components/error-boundary";
import {
  clearAllAppData,
  handleServiceWorkerIssues,
} from "@/lib/recovery-utils";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [persistenceEnabled, setPersistenceEnabled] = useState(true);

  useEffect(() => {
    setMounted(true);
    const success = enablePersistence();
    setPersistenceEnabled(success);
  }, []);

  if (!mounted) {
    return null;
  }

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
            type="button"
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

        <div className="flex-1">
          <div className="w-full max-w-md mx-auto">
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
      </div>
    </ErrorBoundary>
  );
}
