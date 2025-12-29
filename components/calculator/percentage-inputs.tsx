"use client"

import { useCallback } from "react"
import { Info, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { progressionSchemes } from "@/lib/progression-utils"
import CalculatorInput from "./calculator-input"

interface PercentageInputsProps {
  targetWeight: string
  selectedScheme: string
  onTargetWeightChange: (value: string) => void
  onSchemeChange: (value: string) => void
  handleWeightInputChange: (value: string, setter: (value: string) => void) => void
  mode?: string
}

export default function PercentageInputs({
  targetWeight,
  selectedScheme,
  onTargetWeightChange,
  onSchemeChange,
  handleWeightInputChange,
  mode = "percentage",
}: PercentageInputsProps) {
  const handleChange = useCallback(
    (value: string) => {
      handleWeightInputChange(value, onTargetWeightChange)
    },
    [handleWeightInputChange, onTargetWeightChange],
  )

  // Check if this is 1RM mode and no weight has been entered yet
  const showWeightPrompt = mode === "1rm" && (!targetWeight || targetWeight === "0")

  return (
    <div className="space-y-6">
      {/* Show a Memphis-style prompt for 1RM mode when no weight is entered */}
      {showWeightPrompt && (
        <div className="relative bg-[hsl(var(--primary))/10] p-6 rounded-lg border-2 border-[hsl(var(--primary))] mb-6 text-center overflow-hidden">
          {/* Memphis-style decorative elements */}
          <div
            className="absolute top-0 left-0 w-12 h-12 bg-[hsl(var(--accent))] rounded-full opacity-30 animate-bounce"
            style={{ left: "10%", animationDuration: "2s", animationDelay: "0.1s" }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-16 h-16 bg-[hsl(var(--secondary))] rounded-full opacity-30 animate-bounce"
            style={{ right: "15%", animationDuration: "2.5s", animationDelay: "0.3s" }}
          ></div>

          {/* Zigzag line */}
          <div className="absolute left-0 right-0 top-0 h-4 overflow-hidden">
            <div className="w-full h-8 animate-pulse" style={{ animationDuration: "1.8s" }}>
              <svg width="100%" height="8" className="transform rotate-180">
                <path
                  d="M0,0 L10,8 L20,0 L30,8 L40,0 L50,8 L60,0 L70,8 L80,0 L90,8 L100,0"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  style={{ strokeDasharray: "125", strokeDashoffset: "125", animation: "dash 2s linear infinite" }}
                />
              </svg>
            </div>
          </div>

          {/* Triangle */}
          <div
            className="absolute -left-4 bottom-4 w-0 h-0 animate-spin"
            style={{ animationDuration: "8s", transformOrigin: "center" }}
          >
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[20px] border-b-[hsl(var(--secondary))] border-r-[12px] border-r-transparent"></div>
          </div>

          {/* Square */}
          <div
            className="absolute -right-2 top-6 w-8 h-8 bg-[hsl(var(--accent))] opacity-40 animate-spin"
            style={{ animationDuration: "7s", transformOrigin: "center" }}
          ></div>

          {/* Content */}
          <div className="relative z-10">
            <ArrowDown className="mx-auto mb-2 text-[hsl(var(--primary))] animate-bounce" />
            <p className="font-bold text-lg">Enter your 1RM target weight below</p>
            <p className="text-sm mt-1 text-gray-300">This will calculate your progression sets</p>
          </div>
        </div>
      )}

      <CalculatorInput
        id="targetWeight"
        label={mode === "1rm" ? "1RM Target Weight (lbs)" : "Target/1RM Weight (lbs)"}
        value={targetWeight}
        onChange={handleChange}
        placeholder="Enter max weight"
        inputClassName={`h-20 text-center text-4xl ${mode === "1rm" ? "border-[hsl(var(--primary))] border-2" : ""}`}
      />

      {/* Don't show scheme selector in 1RM mode since it's fixed */}
      {mode !== "1rm" && (
        <div className="flex items-center">
          <div className="text-lg font-bold mr-2">Scheme:</div>
          <Select value={selectedScheme} onValueChange={onSchemeChange}>
            <SelectTrigger className="h-12 text-lg border-[hsl(var(--primary))] bg-gray-900 flex-1">
              <SelectValue placeholder="Select scheme" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(progressionSchemes).map(([key, scheme]) => (
                <SelectItem key={key} value={key} className="text-base">
                  {scheme.algorithmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-1 p-1 h-8 w-8">
                  <Info size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  {progressionSchemes[selectedScheme]?.description || "Loading scheme description..."}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Display info about 1RM preset */}
      {mode === "1rm" && (
        <div className="bg-gray-800 p-3 rounded-md">
          <div className="text-md font-bold mb-1">1RM Configuration:</div>
          <div className="text-sm">• 7 sets of 1 rep</div>
          <div className="text-sm">• Standard Load Progression</div>
          <div className="text-sm">• 0,2,4,6,9,12,15 minute timing pattern</div>
        </div>
      )}
    </div>
  )
}
