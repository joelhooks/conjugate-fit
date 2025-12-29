"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Minus, Plus, Infinity } from "lucide-react"
import {
  ALL_AVAILABLE_PLATES,
  PLATE_COLORS,
  PLATE_TEXT_COLORS,
  PLATE_HEIGHTS,
  PLATE_THICKNESS,
} from "@/lib/plate-constants"
import { useSettingsStore } from "@/lib/stores/settings-store"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function PlatePicker() {
  const [isOpen, setIsOpen] = useState(false)
  const selectedPlates = useSettingsStore((state) => state.selectedPlates)
  const togglePlate = useSettingsStore((state) => state.togglePlate)
  const plateQuantities = useSettingsStore((state) => state.plateQuantities)
  const setPlateQuantity = useSettingsStore((state) => state.setPlateQuantity)

  const getPlateColorClass = (weight: number): string => {
    return PLATE_COLORS[weight] || "bg-gray-500"
  }

  const getPlateTextColorClass = (weight: number): string => {
    return PLATE_TEXT_COLORS[weight] || "text-black"
  }

  const getQuantity = (plate: number): number | null => {
    return plateQuantities[plate] ?? null
  }

  const handleQuantityChange = (plate: number, delta: number) => {
    const current = getQuantity(plate)
    if (current === null) {
      // Going from unlimited to a number
      setPlateQuantity(plate, Math.max(1, delta > 0 ? 2 : 1))
    } else {
      const newQty = current + delta
      if (newQty <= 0) {
        // Disable the plate if quantity goes to 0
        if (selectedPlates.includes(plate)) {
          togglePlate(plate)
        }
        setPlateQuantity(plate, null)
      } else {
        setPlateQuantity(plate, newQty)
      }
    }
  }

  const toggleUnlimited = (plate: number) => {
    const current = getQuantity(plate)
    if (current === null) {
      setPlateQuantity(plate, 1)
    } else {
      setPlateQuantity(plate, null)
    }
  }

  const renderCollapsedPlates = () => {
    const sortedPlates = [...selectedPlates].sort((a, b) => b - a)
    if (sortedPlates.length === 0) {
      return <div className="text-xs text-gray-400 py-2">No plates selected</div>
    }
    const maxHeight = Math.max(...sortedPlates.map((p) => PLATE_HEIGHTS[p] || 30), 30)

    return (
      <div className="flex items-center justify-center gap-0 py-2 px-1 bg-gray-900 rounded-lg">
        {/* Sleeve/collar left */}
        <div className="h-3 w-2 bg-gray-600 rounded-l-sm" />

        {/* Plates stacked from heaviest to lightest */}
        <div className="flex items-center">
          {sortedPlates.map((plate, index) => {
            const height = PLATE_HEIGHTS[plate] || 30
            const thickness = PLATE_THICKNESS[plate] || 12
            const scaledHeight = Math.max(16, (height / maxHeight) * 32)
            const scaledThickness = Math.max(6, thickness * 0.4)
            const qty = getQuantity(plate)

            return (
              <div
                key={`${plate}-${index}`}
                className={`${getPlateColorClass(plate)} border-r border-gray-800/50 flex items-center justify-center relative`}
                style={{
                  height: `${scaledHeight}px`,
                  width: `${scaledThickness}px`,
                }}
                title={`${plate} lb${qty !== null ? ` (${qty} pair${qty > 1 ? "s" : ""})` : " (unlimited)"}`}
              />
            )
          })}
        </div>

        {/* Bar */}
        <div className="h-1.5 w-8 bg-gray-500" />

        {/* Mirror plates */}
        <div className="flex items-center">
          {[...sortedPlates].reverse().map((plate, index) => {
            const height = PLATE_HEIGHTS[plate] || 30
            const thickness = PLATE_THICKNESS[plate] || 12
            const scaledHeight = Math.max(16, (height / maxHeight) * 32)
            const scaledThickness = Math.max(6, thickness * 0.4)

            return (
              <div
                key={`${plate}-mirror-${index}`}
                className={`${getPlateColorClass(plate)} border-l border-gray-800/50 flex items-center justify-center`}
                style={{
                  height: `${scaledHeight}px`,
                  width: `${scaledThickness}px`,
                }}
                title={`${plate} lb`}
              />
            )
          })}
        </div>

        {/* Sleeve/collar right */}
        <div className="h-3 w-2 bg-gray-600 rounded-r-sm" />
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="w-full">
        <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Available Plates</span>
              <span className="text-xs text-gray-400">({selectedPlates.length} selected)</span>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>

          {!isOpen && renderCollapsedPlates()}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="p-4 bg-gray-800/80 border border-gray-700 border-t-0 rounded-b-lg space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALL_AVAILABLE_PLATES.map((plate) => {
              const isSelected = selectedPlates.includes(plate)
              const height = PLATE_HEIGHTS[plate] || 30
              const thickness = PLATE_THICKNESS[plate] || 12
              const scaledHeight = Math.max(28, height * 0.6)
              const scaledThickness = Math.max(16, thickness * 0.7)
              const quantity = getQuantity(plate)

              return (
                <div
                  key={plate}
                  className={`
                    relative flex flex-col rounded-lg border-2 transition-all overflow-hidden
                    ${isSelected ? "border-white bg-gray-700" : "border-gray-600 bg-gray-800 opacity-50"}
                  `}
                >
                  {/* Toggle button area */}
                  <button
                    onClick={() => togglePlate(plate)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-600/30 transition-colors"
                  >
                    {/* Plate visual */}
                    <div
                      className={`${getPlateColorClass(plate)} rounded-sm flex items-center justify-center border border-gray-900/30 shrink-0`}
                      style={{
                        height: `${scaledHeight}px`,
                        width: `${scaledThickness}px`,
                      }}
                    >
                      <span
                        className={`text-[8px] font-bold ${getPlateTextColorClass(plate)}`}
                        style={{ writingMode: scaledThickness < 20 ? "vertical-rl" : "horizontal-tb" }}
                      >
                        {plate}
                      </span>
                    </div>

                    {/* Weight label and status */}
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{plate} lb</span>
                      <span className="text-[10px] text-gray-400">
                        {isSelected
                          ? quantity === null
                            ? "Unlimited"
                            : `${quantity} pair${quantity > 1 ? "s" : ""}`
                          : "Disabled"}
                      </span>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Quantity controls - only show when selected */}
                  {isSelected && (
                    <div className="flex items-center justify-between px-2 py-1.5 bg-gray-900/50 border-t border-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuantityChange(plate, -1)
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleUnlimited(plate)
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors min-w-[48px] ${
                          quantity === null ? "bg-pink-600 text-white" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {quantity === null ? <Infinity className="w-4 h-4 mx-auto" /> : quantity}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuantityChange(plate, 1)
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <p className="text-[10px] text-gray-500 text-center">
            Tap a plate to enable/disable. Adjust quantity (pairs per side) or set to unlimited.
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
