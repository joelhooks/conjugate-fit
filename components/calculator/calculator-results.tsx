"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import SimplifiedPlateVisualizer from "../simplified-plate-visualizer";
import { useCalculatorState } from "@/lib/stores/calculator-store";

interface CalculatorResultsProps {
  onReset: () => void;
}

export default function CalculatorResults({ onReset }: CalculatorResultsProps) {
  const calculator = useCalculatorState();

  // Ensure calculatedWeights and percentages are properly initialized
  const calculatedWeights = calculator?.calculatedWeights || [];
  const percentages = calculator?.percentages || {};

  // Ensure calculatedWeights is an array, even if it's undefined
  const safeWeights = Array.isArray(calculatedWeights) ? calculatedWeights : [];

  if (safeWeights.length === 0) return null;

  return (
    <div className="mt-8 pt-6 border-t border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl">Results</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-base"
        >
          <RotateCcw size={18} className="mr-1" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {safeWeights.map((weight, index) => {
          // Get percentage display if available
          const percentageDisplay =
            percentages && percentages[index]
              ? ` (${percentages[index]}%)`
              : "";

          return (
            <div
              key={`set-${index}-${weight}`}
              className="bg-gray-900 p-3 rounded-lg"
            >
              <div className="flex justify-between items-center">
                <span className="text-lg">Set {index + 1}:</span>
                <span className="text-2xl mono">
                  {weight} lbs
                  <span className="text-sm text-gray-400 ml-2">
                    {percentageDisplay}
                  </span>
                </span>
              </div>

              {/* Simplified plate visualization */}
              <div className="mt-2 w-full">
                <SimplifiedPlateVisualizer weight={weight} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
