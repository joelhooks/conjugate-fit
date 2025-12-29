"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import SimplifiedPlateVisualizer from "../simplified-plate-visualizer"
import { useCalculatorState } from "@/lib/stores/calculator-store"
import { hasItems } from "@/lib/utils/array-utils"

interface CalculatorResultsProps {
  onReset: () => void
}

export default function CalculatorResults({ onReset }: CalculatorResultsProps) {
  const calculator = useCalculatorState()

  // Ensure calculatedWeights and percentages are properly initialized
  const calculatedWeights = calculator?.calculatedWeights || []
  const percentages = calculator?.percentages || {}

  // Ensure calculatedWeights is an array, even if it's undefined
  const safeWeights = Array.isArray(calculatedWeights) ? calculatedWeights : []

  if (!hasItems(safeWeights)) return null

  return (
    <div className="mt-6 pt-3 border-t border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold">Results</h3>
        <Button variant="outline" size="sm" onClick={onReset} className="text-sm">
          <RotateCcw size={16} className="mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {safeWeights.map((weight, index) => {
          // Get percentage display if available
          const percentageDisplay = percentages && percentages[index] ? ` (${percentages[index]}%)` : ""

          return (
            <div key={index} className="bg-gray-900 p-2 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold">Set {index + 1}:</span>
                <span className="text-xl font-bold mono">
                  {weight} lbs
                  <span className="text-xs text-gray-400 ml-1">{percentageDisplay}</span>
                </span>
              </div>

              {/* Simplified plate visualization */}
              <div className="mt-1 w-full">
                <SimplifiedPlateVisualizer weight={weight} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
