"use client"

import { useCallback } from "react"
import CalculatorInput from "./calculator-input"

interface UniformInputsProps {
  uniformWeight: string
  onUniformWeightChange: (value: string) => void
  handleWeightInputChange: (value: string, setter: (value: string) => void) => void
}

export default function UniformInputs({
  uniformWeight,
  onUniformWeightChange,
  handleWeightInputChange,
}: UniformInputsProps) {
  const handleChange = useCallback(
    (value: string) => {
      handleWeightInputChange(value, onUniformWeightChange)
    },
    [handleWeightInputChange, onUniformWeightChange],
  )

  return (
    <div className="space-y-6">
      <CalculatorInput
        id="uniformWeight"
        label="Weight for All Sets (lbs)"
        value={uniformWeight}
        onChange={handleChange}
        placeholder="Enter weight"
        inputClassName="h-20 text-center text-4xl"
      />
    </div>
  )
}
