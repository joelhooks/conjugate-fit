"use client";

import { useMemo } from "react";
import {
  PLATE_COLORS,
  PLATE_TEXT_COLORS,
  PLATE_HEIGHTS,
  PLATE_THICKNESS,
} from "@/lib/plate-constants";
import {
  useBarWeight,
  useSelectedPlates,
  usePlateQuantities,
} from "@/lib/stores/settings-store";

interface SimplifiedPlateVisualizerProps {
  weight: number;
  barWeight?: number;
  includeSmallPlates?: boolean;
  /** Scale factor for plate sizes (default 1). Use 1.5-2 for zoom views. */
  scale?: number;
  /** Hide the bar ends for a cleaner look */
  hideBar?: boolean;
}

export default function SimplifiedPlateVisualizer({
  weight,
  barWeight: propBarWeight,
  includeSmallPlates = true,
  scale = 1,
  hideBar = false,
}: SimplifiedPlateVisualizerProps) {
  const storeBarWeight = useBarWeight();
  const barWeight =
    propBarWeight !== undefined ? propBarWeight : storeBarWeight || 45;

  const selectedPlates = useSelectedPlates();
  const plateQuantities = usePlateQuantities();

  const safeWeight = typeof weight === "number" ? weight : 0;

  const plates = useMemo(() => {
    try {
      const weightPerSide = Math.max(0, (safeWeight - barWeight) / 2);
      const platesNeeded: Record<number, number> = {};
      let remainingWeight = weightPerSide;

      const availablePlates = [...selectedPlates].sort((a, b) => b - a);
      const filteredPlates = includeSmallPlates
        ? availablePlates
        : availablePlates.filter((plate) => plate > 2.5);

      for (const plate of filteredPlates) {
        const maxAvailable = plateQuantities[plate] ?? Number.POSITIVE_INFINITY;
        const idealCount = Math.floor(remainingWeight / plate);
        const count = Math.min(idealCount, maxAvailable);

        if (count > 0) {
          platesNeeded[plate] = count;
          remainingWeight -= count * plate;
        }
      }

      return platesNeeded;
    } catch (error) {
      console.error("Error calculating plates:", error);
      return {};
    }
  }, [
    safeWeight,
    barWeight,
    includeSmallPlates,
    selectedPlates,
    plateQuantities,
  ]);

  const getPlateColorClass = (weight: number): string => {
    return PLATE_COLORS[weight] || "bg-gray-500";
  };

  const getPlateTextColorClass = (weight: number): string => {
    return PLATE_TEXT_COLORS[weight] || "text-black";
  };

  const getPlateHeight = (weight: number): number => {
    return PLATE_HEIGHTS[weight] || 30;
  };

  const getPlateWidth = (weight: number): number => {
    return PLATE_THICKNESS[weight] || 14;
  };

  // Scale-adjusted sizes
  const barHeight = 6 * scale;
  const barWidth = 24 * scale;
  const plateGap = 3 * scale;
  const textSize = scale >= 2 ? 14 : scale >= 1.5 ? 11 : 9;

  if (safeWeight <= barWeight) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-400">
          Just the bar ({barWeight} lbs)
        </div>
      </div>
    );
  }

  const safePlates = plates || {};
  const plateEntries = Object.entries(safePlates);

  const calculatedWeight =
    barWeight +
    Object.entries(safePlates).reduce(
      (sum, [weight, count]) => sum + Number(weight) * count * 2,
      0,
    );
  const shortfall = safeWeight - calculatedWeight;

  const plateVisualization = (
    <div className="flex items-center">
      {/* Bar left */}
      {!hideBar && (
        <div
          className="bg-gray-500 rounded-l-full flex-shrink-0"
          style={{ height: barHeight, width: barWidth }}
        />
      )}

      {/* Plates on one side */}
      <div className="flex items-center">
        {plateEntries
          .sort(([a], [b]) => Number(b) - Number(a))
          .flatMap(([plateWeight, count], plateIndex) => {
            const w = Number.parseFloat(plateWeight);
            return Array.from({ length: (count as number) || 0 }, (_, i) => (
              <div
                key={`plate-${w}-${i}-of-${count}`}
                className={`${getPlateColorClass(w)} border border-gray-800 relative flex items-center justify-center flex-shrink-0`}
                style={{
                  height: `${getPlateHeight(w) * scale}px`,
                  width: `${getPlateWidth(w) * scale}px`,
                  marginLeft:
                    hideBar && plateIndex === 0 && i === 0
                      ? 0
                      : `${plateGap}px`,
                }}
                title={`${w} lb plate`}
              >
                <span
                  className={`font-bold ${getPlateTextColorClass(w)}`}
                  style={{ fontSize: `${textSize}px` }}
                >
                  {w}
                </span>
              </div>
            ));
          })}
      </div>

      {/* Bar right */}
      {!hideBar && (
        <div
          className="bg-gray-500 rounded-r-full flex-shrink-0"
          style={{ height: barHeight, width: barWidth }}
        />
      )}
    </div>
  );

  return (
    <div className={`flex flex-col w-full ${hideBar ? "" : "items-center"}`}>
      <div
        className={`flex items-center w-full py-1 ${hideBar ? "" : "justify-center"}`}
      >
        {plateVisualization}
      </div>

      {shortfall > 0.1 && (
        <div
          className="text-amber-400 mt-1"
          style={{ fontSize: `${10 * scale}px` }}
        >
          Short {shortfall.toFixed(1)} lbs (limited plates)
        </div>
      )}
    </div>
  );
}
