"use client"

import { useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import CalculatorInput from "./calculator-input"

interface ProgressiveInputsProps {
  baseWeight: string
  incrementPercent: number
  onBaseWeightChange: (value: string) => void
  onIncrementPercentChange: (value: number) => void
  handleWeightInputChange: (value: string, setter: (value: string) => void) => void
}

export default function ProgressiveInputs({
  baseWeight,
  incrementPercent,
  onBaseWeightChange,
  onIncrementPercentChange,
  handleWeightInputChange,
}: ProgressiveInputsProps) {
  const handleChange = useCallback(
    (value: string) => {
      handleWeightInputChange(value, onBaseWeightChange)
    },
    [handleWeightInputChange, onBaseWeightChange],
  )

  return (
    <div className="space-y-6">
      <CalculatorInput
        id="baseWeight"
        label="Starting Weight (lbs)"
        value={baseWeight}
        onChange={handleChange}
        placeholder="Enter starting weight"
        inputClassName="h-20 text-center text-4xl"
      />

      <div>
        <div className="flex justify-between mb-2">
          <div className="text-lg font-bold">Increment Per Set: {incrementPercent}%</div>
        </div>
        <Slider
          min={2.5}
          max={20}
          step={2.5}
          value={[incrementPercent]}
          onValueChange={(value) => {
            onIncrementPercentChange(value[0])
          }}
          className="mb-6 h-6"
        />
      </div>
    </div>
  )
}
