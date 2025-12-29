"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Clock, Dumbbell } from "lucide-react"

export type RestInterval = {
  minutes: number
  seconds: number
  label: string
}

export type TimingPattern = {
  id: string
  name: string
  description: string
  isCustom: boolean
  intervals: number[] // Intervals in seconds
}

export const PRESET_INTERVALS: RestInterval[] = [
  { minutes: 0, seconds: 30, label: "0:30" },
  { minutes: 0, seconds: 45, label: "0:45" },
  { minutes: 1, seconds: 0, label: "1:00" },
  { minutes: 1, seconds: 30, label: "1:30" },
  { minutes: 2, seconds: 0, label: "2:00" },
  { minutes: 2, seconds: 15, label: "2:15" },
  { minutes: 3, seconds: 0, label: "3:00" },
]

export const TIMING_PATTERNS: TimingPattern[] = [
  {
    id: "1rm",
    name: "1RM Pattern",
    description: "Standard timing for 1RM progression (0, 2, 4, 6, 9, 12, 15 min)",
    isCustom: false,
    intervals: [0, 2 * 60, 4 * 60, 6 * 60, 9 * 60, 12 * 60, 15 * 60],
  },
  {
    id: "uniform",
    name: "Uniform Timing",
    description: "Equal time between all sets",
    isCustom: false,
    intervals: [],
  },
  {
    id: "custom",
    name: "Custom Pattern",
    description: "Define your own timing between sets",
    isCustom: true,
    intervals: [],
  },
]

interface RestIntervalSelectorProps {
  selectedInterval: RestInterval | null
  onSelectInterval: (interval: RestInterval) => void
  selectedPattern: TimingPattern | null
  onSelectPattern: (pattern: TimingPattern) => void
  calculationMode?: string
}

export default function RestIntervalSelector({
  selectedInterval,
  onSelectInterval,
  selectedPattern,
  onSelectPattern,
  calculationMode = "1rm",
}: RestIntervalSelectorProps) {
  const [customMinutes, setCustomMinutes] = useState("0")
  const [customSeconds, setCustomSeconds] = useState("0")
  const [showCustom, setShowCustom] = useState(false)
  const [activeTab, setActiveTab] = useState<"interval" | "pattern">("interval")

  const handleCustomIntervalSubmit = () => {
    const minutes = Number.parseInt(customMinutes) || 0
    const seconds = Number.parseInt(customSeconds) || 0

    if (minutes === 0 && seconds === 0) return

    const totalSeconds = minutes * 60 + seconds
    const label = `${minutes}:${seconds.toString().padStart(2, "0")}`

    onSelectInterval({ minutes, seconds, label })
    setShowCustom(false)
  }

  const selectedValue = selectedInterval
    ? `${selectedInterval.minutes}:${selectedInterval.seconds.toString().padStart(2, "0")}`
    : ""

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-[hsl(var(--primary))]" />
          <Label className="text-lg font-bold">Timing</Label>
        </div>
        <div className="flex border border-gray-700 rounded-md overflow-hidden">
          <button
            onClick={() => setActiveTab("interval")}
            className={`px-3 py-1 text-sm ${activeTab === "interval" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800"}`}
          >
            Fixed Interval
          </button>
          <button
            onClick={() => setActiveTab("pattern")}
            className={`px-3 py-1 text-sm ${activeTab === "pattern" ? "bg-[hsl(var(--primary))] text-white" : "bg-gray-800"}`}
          >
            Timing Pattern
          </button>
        </div>
      </div>

      {activeTab === "interval" && (
        <>
          <RadioGroup
            value={selectedValue}
            onValueChange={(value) => {
              const [mins, secs] = value.split(":").map((v) => Number.parseInt(v))
              const preset = PRESET_INTERVALS.find((p) => p.minutes === mins && p.seconds === secs)
              if (preset) {
                onSelectInterval(preset)
                // Also select the uniform pattern
                onSelectPattern(TIMING_PATTERNS.find((p) => p.id === "uniform")!)
              }
            }}
            className="grid grid-cols-4 gap-2"
          >
            {PRESET_INTERVALS.map((interval) => (
              <div key={interval.label} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={`${interval.minutes}:${interval.seconds.toString().padStart(2, "0")}`}
                  id={`interval-${interval.label}`}
                />
                <Label htmlFor={`interval-${interval.label}`} className="text-sm font-medium">
                  {interval.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {!showCustom ? (
            <Button variant="outline" size="sm" onClick={() => setShowCustom(true)} className="mt-2">
              Custom Interval
            </Button>
          ) : (
            <div className="flex items-end gap-2 mt-2">
              <div>
                <Label htmlFor="custom-minutes" className="text-sm">
                  Minutes
                </Label>
                <Input
                  id="custom-minutes"
                  type="number"
                  min="0"
                  max="10"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-20 h-9"
                />
              </div>
              <div>
                <Label htmlFor="custom-seconds" className="text-sm">
                  Seconds
                </Label>
                <Input
                  id="custom-seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(e.target.value)}
                  className="w-20 h-9"
                />
              </div>
              <Button size="sm" onClick={handleCustomIntervalSubmit} className="ml-2">
                Set
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCustom(false)}>
                Cancel
              </Button>
            </div>
          )}
        </>
      )}

      {activeTab === "pattern" && (
        <div className="space-y-3">
          <RadioGroup
            value={selectedPattern?.id || ""}
            onValueChange={(value) => {
              const pattern = TIMING_PATTERNS.find((p) => p.id === value)
              if (pattern) {
                onSelectPattern(pattern)

                // If 1RM pattern is selected, select a default interval (2:00) for display purposes
                if (pattern.id === "1rm") {
                  onSelectInterval({ minutes: 2, seconds: 0, label: "1RM Pattern" })
                }
              }
            }}
            className="space-y-2"
          >
            {TIMING_PATTERNS.map((pattern) => (
              <div
                key={pattern.id}
                className={`flex items-start space-x-2 p-2 rounded-md ${
                  selectedPattern?.id === pattern.id ? "bg-gray-800" : ""
                }`}
              >
                <RadioGroupItem value={pattern.id} id={`pattern-${pattern.id}`} className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor={`pattern-${pattern.id}`} className="text-sm font-medium flex items-center">
                    {pattern.id === "1rm" && <Dumbbell size={16} className="mr-1 text-[hsl(var(--primary))]" />}
                    {pattern.name}
                  </Label>
                  <p className="text-xs text-gray-400">{pattern.description}</p>

                  {/* Show the actual intervals for 1RM pattern */}
                  {pattern.id === "1rm" && (
                    <div className="grid grid-cols-7 gap-1 mt-1">
                      {[0, 2, 4, 6, 9, 12, 15].map((mins, i) => (
                        <div key={i} className="bg-gray-900 px-2 py-1 rounded text-xs text-center">
                          {i === 0 ? "Start" : `+${mins}m`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </RadioGroup>

          {selectedPattern?.isCustom && (
            <div className="mt-2 p-3 border border-gray-700 rounded-md">
              <p className="text-sm mb-2">Custom timing pattern setup coming soon</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
