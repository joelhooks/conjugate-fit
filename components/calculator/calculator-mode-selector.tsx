"use client"

import type React from "react"
import { TrendingUp, Dumbbell } from "lucide-react"

export type CalculatorMode = "1rm" | "uniform"

interface CalculatorModeSelectorProps {
  mode: CalculatorMode
  onChange: (mode: CalculatorMode) => void
}

export default function CalculatorModeSelector({ mode, onChange }: CalculatorModeSelectorProps) {
  // Mode configuration
  const modes: { id: CalculatorMode; label: string; icon: React.ReactNode }[] = [
    {
      id: "1rm",
      label: "1RM",
      icon: <TrendingUp size={24} />,
    },
    {
      id: "uniform",
      label: "Uniform",
      icon: <Dumbbell size={24} />,
    },
  ]

  return (
    <div className="flex justify-between mb-6 gap-2">
      {modes.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex-1 flex flex-col items-center justify-center py-4 rounded-lg transition-all ${
            mode === item.id
              ? "bg-[hsl(var(--primary))] text-black shadow-lg transform scale-105"
              : "bg-gray-900 text-white hover:bg-gray-800"
          }`}
        >
          {item.icon}
          <span className="mt-2 font-bold text-sm">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
