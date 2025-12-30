"use client";

import { useState, useEffect, useRef } from "react";

import SimplifiedPlateVisualizer from "../simplified-plate-visualizer";
import { useCalculatorState } from "@/lib/stores/calculator-store";
import { hasItems } from "@/lib/utils/array-utils";
import {
  type RestInterval,
  type TimingPattern,
  TIMING_PATTERNS,
} from "../timer/rest-interval-selector";
import SetZoomView from "./set-zoom-view";

interface CalculatorResultsWithTimerProps {
  onReset?: () => void;
  is1RM?: boolean;
  oneRmTimingSet?: boolean;
}

export default function CalculatorResultsWithTimer({
  is1RM = false,
  oneRmTimingSet = false,
}: CalculatorResultsWithTimerProps) {
  const calculator = useCalculatorState();
  const [showTimer, setShowTimer] = useState(is1RM);
  const [restInterval, setRestInterval] = useState<RestInterval | null>(null);
  const [timingPattern, setTimingPattern] = useState<TimingPattern | null>(
    null,
  );
  const [showZoom, setShowZoom] = useState(false);

  // Use a ref to track if we've already set up the 1RM timing
  const oneRmTimingInitialized = useRef(false);

  // Ensure calculatedWeights and percentages are properly initialized
  const calculatedWeights = calculator?.calculatedWeights || [];
  const percentages = calculator?.percentages || {};

  // Ensure calculatedWeights is an array, even if it's undefined
  const safeWeights = Array.isArray(calculatedWeights) ? calculatedWeights : [];

  // Auto-select 1RM pattern for 1RM mode or when using percentage mode with 7 sets
  useEffect(() => {
    // Only run this once to prevent infinite loops
    if ((is1RM || oneRmTimingSet) && !oneRmTimingInitialized.current) {
      // Find the 1RM pattern
      const oneRmPattern = TIMING_PATTERNS.find((p) => p.id === "1rm");
      if (oneRmPattern) {
        setTimingPattern(oneRmPattern);
        // Set a default display interval
        setRestInterval({ minutes: 2, seconds: 0, label: "1RM Pattern" });
        // Show timer by default for 1RM mode
        setShowTimer(true);
        // Mark as initialized
        oneRmTimingInitialized.current = true;
      }
    }
  }, [is1RM, oneRmTimingSet]);

  // Reset the initialization flag if mode changes
  useEffect(() => {
    if (!is1RM && !oneRmTimingSet) {
      oneRmTimingInitialized.current = false;
    }
  }, [is1RM, oneRmTimingSet]);

  // Function to format time as MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate time intervals for each set based on pattern or fixed interval
  const getTimeIntervals = () => {
    if (!restInterval) return [];

    // If using 1RM pattern, return those specific intervals
    if (timingPattern?.id === "1rm") {
      return timingPattern.intervals;
    }

    // Otherwise use uniform intervals
    const intervals = [];
    const intervalSeconds = restInterval.minutes * 60 + restInterval.seconds;

    for (let i = 0; i < safeWeights.length; i++) {
      intervals.push(i * intervalSeconds);
    }

    return intervals;
  };

  const timeIntervals = getTimeIntervals();

  // Always render the container with a minimum height to prevent layout shift
  return (
    <>
      {/* Zoom view modal */}
      {showZoom && (
        <SetZoomView
          weights={safeWeights}
          percentages={percentages}
          onClose={() => setShowZoom(false)}
        />
      )}

      <div className="mt-8 min-h-[200px]">
        {/* Zoom button */}
        {hasItems(safeWeights) && (
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => setShowZoom(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg">👴</span>
              Zoom
            </button>
          </div>
        )}

        {hasItems(safeWeights) ? (
          <div className="grid grid-cols-1 gap-2">
            {safeWeights.map((weight, index) => {
              // Get percentage display if available
              const percentageDisplay =
                percentages && percentages[index]
                  ? ` (${percentages[index]}%)`
                  : "";

              // Get time interval display based on pattern
              const timeValue = timeIntervals[index];
              let timeDisplay = null;

              if (showTimer && restInterval && timeValue !== undefined) {
                if (timingPattern?.id === "1rm") {
                  // Special display for 1RM pattern
                  timeDisplay = index === 0 ? "Start" : `+${timeValue / 60}m`;
                } else {
                  // Normal time display for other patterns
                  timeDisplay = formatTime(timeValue);
                }
              }

              return (
                <div key={index} className="bg-gray-900 p-2 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-base font-bold">
                        Set {index + 1}:
                      </span>
                      {timeDisplay && (
                        <span className="ml-2 text-sm bg-gray-800 px-2 py-1 rounded mono text-[hsl(var(--primary))]">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <span className="text-xl font-bold mono">
                      {weight} lbs
                      <span className="text-xs text-gray-400 ml-1">
                        {percentageDisplay}
                      </span>
                    </span>
                  </div>

                  {/* Simplified plate visualization */}
                  <div className="mt-1 w-full">
                    <SimplifiedPlateVisualizer weight={weight} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Empty state placeholder to maintain height
          <div className="h-[72px] flex items-center justify-center text-gray-500">
            Enter a weight to see results
          </div>
        )}
      </div>
    </>
  );
}
