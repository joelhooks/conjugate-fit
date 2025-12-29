"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CalculatorInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  min?: number
  max?: number
  step?: number
}

export default function CalculatorInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  className = "",
  inputClassName = "",
  min,
  max,
  step,
}: CalculatorInputProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-lg font-bold">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-gray-900 border-gray-700 text-white text-xl font-bold mono ${inputClassName}`}
        placeholder={placeholder}
      />
    </div>
  )
}
