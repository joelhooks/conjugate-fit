"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Dumbbell, TrendingUp } from "lucide-react"
import { progressionSchemes } from "@/lib/progression-utils"
import type { CalculatorHistoryEntry } from "@/lib/stores/types"
import { hasItems, safeLength } from "@/lib/utils/array-utils"

interface CalculatorHistoryProps {
  showHistory: boolean
  history: CalculatorHistoryEntry[] | undefined
  calculatedWeights: number[] | undefined
  onToggleHistory: () => void
  onClearHistory: () => void
  onLoadHistoryEntry: (entry: CalculatorHistoryEntry) => void
}

export default function CalculatorHistory({
  showHistory,
  history,
  calculatedWeights,
  onToggleHistory,
  onClearHistory,
  onLoadHistoryEntry,
}: CalculatorHistoryProps) {
  // Ensure calculatedWeights is an array, even if it's undefined
  const safeCalculatedWeights = Array.isArray(calculatedWeights) ? calculatedWeights : []
  const safeHistory = Array.isArray(history) ? history : []

  // Don't render anything if there are no calculated weights
  if (!hasItems(safeCalculatedWeights)) return null

  return (
    <>
      {/* History toggle button */}
      <Button variant="ghost" size="lg" onClick={onToggleHistory} className="mt-6 w-full text-base">
        {showHistory ? (
          <>
            <ChevronUp size={18} className="mr-1" />
            Hide History
          </>
        ) : (
          <>
            <ChevronDown size={18} className="mr-1" />
            Show History
          </>
        )}
      </Button>

      {/* History section */}
      {showHistory && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Recent Calculations</h3>
            {safeLength(safeHistory) > 0 && (
              <Button variant="outline" size="sm" onClick={onClearHistory} className="text-sm">
                Clear
              </Button>
            )}
          </div>

          {safeLength(safeHistory) === 0 ? (
            <p className="text-base text-gray-400">No calculation history yet.</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {safeHistory.map((entry) => (
                <Card
                  key={entry?.id || Math.random().toString()}
                  className="border border-gray-700 bg-gray-900 hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => {
                    if (entry) onLoadHistoryEntry(entry)
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        {entry?.type === "1rm" && <TrendingUp size={18} className="mr-1" />}
                        {entry?.type === "uniform" && <Dumbbell size={18} className="mr-1" />}
                        <span className="font-bold">{entry?.type === "1rm" ? "1RM" : "Uniform"}</span>
                      </div>
                      <span className="text-xs text-gray-400">{entry?.date || "Unknown date"}</span>
                    </div>
                    <div className="mt-2 text-lg">
                      {entry?.sets || 0}×{entry?.reps || 0} @ {entry?.baseWeight || 0}lbs
                      {entry?.type === "1rm" &&
                        entry?.scheme &&
                        progressionSchemes[entry.scheme] &&
                        ` (${progressionSchemes[entry.scheme].algorithmName})`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
