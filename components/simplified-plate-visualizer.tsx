"use client"

import { useMemo } from "react"
import { PLATE_COLORS, PLATE_TEXT_COLORS, PLATE_HEIGHTS, PLATE_THICKNESS } from "@/lib/plate-constants"
import { useBarWeight, useSelectedPlates, usePlateQuantities } from "@/lib/stores/settings-store"
import { errorTracker, ErrorCategory } from "@/lib/error-tracking"

interface SimplifiedPlateVisualizerProps {
  weight: number
  barWeight?: number
  includeSmallPlates?: boolean
}

export default function SimplifiedPlateVisualizer({
  weight,
  barWeight: propBarWeight,
  includeSmallPlates = true,
}: SimplifiedPlateVisualizerProps) {
  const storeBarWeight = useBarWeight()
  const barWeight = propBarWeight !== undefined ? propBarWeight : storeBarWeight || 45

  const selectedPlates = useSelectedPlates()
  const plateQuantities = usePlateQuantities()

  const safeWeight = typeof weight === "number" ? weight : 0

  const plates = useMemo(() => {
    try {
      errorTracker.debug(ErrorCategory.CALCULATION, "Calculating plates", {
        component: "SimplifiedPlateVisualizer",
        action: "useMemo",
        inputs: {
          safeWeight,
          barWeight,
          includeSmallPlates,
          selectedPlates,
          plateQuantities,
        },
      })

      const weightPerSide = Math.max(0, (safeWeight - barWeight) / 2)
      const platesNeeded: Record<number, number> = {}
      let remainingWeight = weightPerSide

      const availablePlates = [...selectedPlates].sort((a, b) => b - a)
      const filteredPlates = includeSmallPlates ? availablePlates : availablePlates.filter((plate) => plate > 2.5)

      errorTracker.debug(ErrorCategory.CALCULATION, "Available plates", {
        component: "SimplifiedPlateVisualizer",
        action: "useMemo",
        state: {
          availablePlatesLength: filteredPlates.length,
          weightPerSide,
        },
      })

      for (const plate of filteredPlates) {
        const maxAvailable = plateQuantities[plate] ?? Number.POSITIVE_INFINITY // null = unlimited
        const idealCount = Math.floor(remainingWeight / plate)
        const count = Math.min(idealCount, maxAvailable)

        if (count > 0) {
          platesNeeded[plate] = count
          remainingWeight -= count * plate
        }
      }

      return platesNeeded
    } catch (error) {
      errorTracker.trackError(ErrorCategory.CALCULATION, error as Error, {
        component: "SimplifiedPlateVisualizer",
        action: "useMemo",
        message: "Error calculating plates",
        inputs: { safeWeight, barWeight, includeSmallPlates },
      })
      return {}
    }
  }, [safeWeight, barWeight, includeSmallPlates, selectedPlates, plateQuantities])

  const getPlateColorClass = (weight: number): string => {
    return PLATE_COLORS[weight] || "bg-gray-500"
  }

  const getPlateTextColorClass = (weight: number): string => {
    return PLATE_TEXT_COLORS[weight] || "text-black"
  }

  const getPlateHeight = (weight: number): number => {
    return PLATE_HEIGHTS[weight] || 30
  }

  const getPlateWidth = (weight: number): number => {
    return PLATE_THICKNESS[weight] || 14
  }

  if (safeWeight <= barWeight) {
    return (
      <div className="flex flex-col items-center">
        <div className="text-xs text-gray-400">Just the bar ({barWeight} lbs)</div>
      </div>
    )
  }

  const safePlates = plates || {}
  const plateEntries = Object.entries(safePlates)

  const calculatedWeight =
    barWeight + Object.entries(safePlates).reduce((sum, [weight, count]) => sum + Number(weight) * count * 2, 0)
  const shortfall = safeWeight - calculatedWeight

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center w-full overflow-x-auto py-1">
        {/* Bar */}
        <div className="h-1.5 w-6 bg-gray-500 rounded-l-full"></div>

        {/* Plates on one side */}
        <div className="flex items-center">
          {plateEntries
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([plateWeight, count]) => {
              const weight = Number.parseFloat(plateWeight)
              const plateArray = Array.from({ length: count || 0 })

              return plateArray.map((_, index) => (
                <div
                  key={`plate-${weight}-${index}`}
                  className={`${getPlateColorClass(weight)} border border-gray-800 relative flex items-center justify-center`}
                  style={{
                    height: `${getPlateHeight(weight)}px`,
                    width: `${getPlateWidth(weight)}px`,
                    marginLeft: "2px",
                  }}
                  title={`${weight} lb plate`}
                >
                  <span className={`text-[9px] font-bold ${getPlateTextColorClass(weight)}`}>{weight}</span>
                </div>
              ))
            })}
        </div>

        {/* Bar end */}
        <div className="h-1.5 w-6 bg-gray-500 rounded-r-full"></div>
      </div>

      {shortfall > 0.1 && (
        <div className="text-[10px] text-amber-400 mt-1">Short {shortfall.toFixed(1)} lbs (limited plates)</div>
      )}
    </div>
  )
}
