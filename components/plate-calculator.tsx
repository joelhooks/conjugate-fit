"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import SimplifiedPlateVisualizer from "./simplified-plate-visualizer"
import BarWeightSelector from "./bar-weight-selector"
import PlatePicker from "./plate-picker"
import { usePlateCalculatorState } from "@/lib/stores/plate-store"
import { useBarWeight } from "@/lib/stores/settings-store"

export default function PlateCalculator() {
  const { weight, setWeight, useSmallPlates, setUseSmallPlates, parsedWeight, weightPerSide } =
    usePlateCalculatorState()
  const barWeight = useBarWeight()

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div>
          <Label htmlFor="total-weight" className="text-xl font-bold">
            Total Weight (lbs)
          </Label>
          <Input
            id="total-weight"
            type="number"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white text-4xl font-bold mono h-20 text-center mt-2"
            placeholder="Enter weight"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <BarWeightSelector />

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="use-small-plates"
                checked={useSmallPlates}
                onCheckedChange={(checked) => setUseSmallPlates(checked as boolean)}
              />
              <Label htmlFor="use-small-plates" className="text-base">
                Use small plates
              </Label>
            </div>
          </div>

          {/* Plate picker directly under bar selector */}
          <PlatePicker />
        </div>

        <div className="bg-gray-900 p-4 rounded-lg">
          <h3 className="text-xl font-bold mb-4 text-center">Plate Breakdown</h3>
          <SimplifiedPlateVisualizer weight={parsedWeight} includeSmallPlates={useSmallPlates} />

          <div className="text-center mt-4 text-lg">
            <span className="font-bold">{weightPerSide}</span> lbs per side
          </div>
        </div>
      </div>
    </div>
  )
}
