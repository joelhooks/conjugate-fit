"use client";

import { useCallback } from "react";
import CalculatorInput from "./calculator-input";

interface PercentageInputsProps {
  targetWeight: string;
  onTargetWeightChange: (value: string) => void;
  handleWeightInputChange: (
    value: string,
    setter: (value: string) => void,
  ) => void;
}

/**
 * Input component for 1RM target weight.
 * Simplified to only support 1RM mode (mode prop and conditionals removed).
 */
export default function PercentageInputs({
  targetWeight,
  onTargetWeightChange,
  handleWeightInputChange,
}: PercentageInputsProps) {
  const handleChange = useCallback(
    (value: string) => {
      handleWeightInputChange(value, onTargetWeightChange);
    },
    [handleWeightInputChange, onTargetWeightChange],
  );

  return (
    <div className="space-y-6">
      <CalculatorInput
        id="targetWeight"
        label="1RM Target Weight (lbs)"
        value={targetWeight}
        onChange={handleChange}
        placeholder="target weight"
        inputClassName="h-28 text-center text-5xl leading-[7rem] border-[hsl(var(--primary))] border-2 placeholder:text-2xl"
      />
    </div>
  );
}
