"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BAR_WEIGHTS } from "@/lib/plate-constants";
import { useBarWeight, useSetBarWeight } from "@/lib/stores/settings-store";
import { Input } from "@/components/ui/input";

export default function BarWeightSelector() {
  const [mounted, setMounted] = useState(false);
  const barWeight = useBarWeight();
  const setBarWeight = useSetBarWeight();
  const [isCustom, setIsCustom] = useState(false);
  const [customWeightInput, setCustomWeightInput] = useState("");

  // Set mounted state on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!BAR_WEIGHTS.includes(barWeight)) {
        setIsCustom(true);
        setCustomWeightInput(barWeight.toString());
      } else {
        // If barWeight is a preset, ensure custom mode is off
        // This handles the case where barWeight might be set to a preset externally
        setIsCustom(false);
      }
    }
  }, [mounted, barWeight]);

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <Label className="text-xl">Bar Weight</Label>
      <RadioGroup
        value={isCustom ? "custom" : barWeight.toString()}
        onValueChange={(val) => {
          if (val === "custom") {
            setIsCustom(true);
            // If customWeightInput is valid, set it, otherwise user needs to type
            const customNum = Number.parseFloat(customWeightInput);
            if (!isNaN(customNum) && customNum > 0) {
              setBarWeight(customNum);
            }
            // else, wait for input change
          } else {
            setIsCustom(false);
            setBarWeight(Number(val));
          }
        }}
        className="flex flex-wrap items-center gap-x-6 gap-y-4"
      >
        {BAR_WEIGHTS.map((weight) => (
          <div key={weight} className="flex items-center space-x-3">
            <RadioGroupItem
              value={weight.toString()}
              id={`bar-${weight}`}
              className="h-5 w-5"
            />
            <Label htmlFor={`bar-${weight}`} className="text-lg cursor-pointer">
              {weight} lb
            </Label>
          </div>
        ))}
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="custom" id="bar-custom" className="h-5 w-5" />
          <Label htmlFor="bar-custom" className="text-lg cursor-pointer">
            Other
          </Label>
        </div>
      </RadioGroup>

      {isCustom && (
        <div className="mt-4 flex items-center space-x-3">
          <Input
            type="number"
            inputMode="decimal"
            id="custom-bar-weight"
            value={customWeightInput}
            onChange={(e) => {
              const val = e.target.value;
              setCustomWeightInput(val);
              const numVal = Number.parseFloat(val);
              if (!isNaN(numVal) && numVal > 0) {
                setBarWeight(numVal);
              } else if (val === "") {
                // Handle empty input, maybe set to a default or do nothing
                // For now, if empty, it won't update the store with a valid number
              }
            }}
            placeholder="Enter weight"
            className="h-12 w-32 bg-gray-800 border-gray-700 text-xl"
            min="0"
            step="0.1"
          />
          <Label htmlFor="custom-bar-weight" className="text-lg">
            lbs
          </Label>
        </div>
      )}
    </div>
  );
}
