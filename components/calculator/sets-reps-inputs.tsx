"use client"

import CalculatorInput from "./calculator-input"
import BarWeightSelector from "../bar-weight-selector"
import PlatePicker from "../plate-picker"

interface SetsRepsInputsProps {
  numSets: string
  repsPerSet: string
  onNumSetsChange: (value: string) => void
  onRepsPerSetChange: (value: string) => void
}

export default function SetsRepsInputs({
  numSets,
  repsPerSet,
  onNumSetsChange,
  onRepsPerSetChange,
}: SetsRepsInputsProps) {
  return (
    <>
      <div className="flex gap-4 mb-6">
        <CalculatorInput
          id="numSets"
          label="Sets"
          value={numSets}
          onChange={onNumSetsChange}
          min={1}
          max={20}
          className="flex-1"
          inputClassName="h-16 text-center text-3xl"
        />
        <CalculatorInput
          id="repsPerSet"
          label="Reps"
          value={repsPerSet}
          onChange={onRepsPerSetChange}
          min={1}
          max={50}
          className="flex-1"
          inputClassName="h-16 text-center text-3xl"
        />
      </div>

      <div className="mb-6 space-y-3">
        <BarWeightSelector />
        <PlatePicker />
      </div>
    </>
  )
}
