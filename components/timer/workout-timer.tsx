"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import type { RestInterval } from "./rest-interval-selector"

interface WorkoutTimerProps {
  restInterval: RestInterval
  setCount: number
}

export default function WorkoutTimer({ restInterval, setCount }: WorkoutTimerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Update current time every second
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  // Calculate the rest interval in milliseconds
  const intervalMs = (restInterval.minutes * 60 + restInterval.seconds) * 1000

  // Start the timer
  const handleStart = () => {
    const now = new Date()
    // Round to the nearest interval
    const msUntilNextInterval = intervalMs - (now.getTime() % intervalMs)
    const nextIntervalTime = new Date(now.getTime() + msUntilNextInterval)

    setStartTime(nextIntervalTime)
    setIsRunning(true)
  }

  // Pause the timer
  const handlePause = () => {
    setIsRunning(false)
  }

  // Reset the timer
  const handleReset = () => {
    setIsRunning(false)
    setStartTime(null)
  }

  // Calculate the next set times
  const getSetTimes = () => {
    if (!startTime) return []

    const times = []
    for (let i = 0; i < setCount; i++) {
      const setTime = new Date(startTime.getTime() + i * intervalMs)
      times.push(setTime)
    }
    return times
  }

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  // Find the next set time
  const findNextSetTime = () => {
    const setTimes = getSetTimes()
    const now = currentTime.getTime()

    return setTimes.find((time) => time.getTime() > now) || null
  }

  const nextSetTime = findNextSetTime()
  const setTimes = getSetTimes()

  return (
    <div className="bg-gray-900 p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Workout Timer</h3>
        <div className="flex space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="sm" className="bg-[hsl(var(--primary))]">
              <Play size={16} className="mr-1" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} size="sm" variant="outline">
              <Pause size={16} className="mr-1" />
              Pause
            </Button>
          )}
          <Button onClick={handleReset} size="sm" variant="outline">
            <RotateCcw size={16} className="mr-1" />
            Reset
          </Button>
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-400">Current Time</div>
        <div className="text-3xl font-bold mono">{formatTime(currentTime)}</div>
      </div>

      {isRunning && nextSetTime && (
        <div className="text-center bg-gray-800 p-2 rounded-md">
          <div className="text-sm text-gray-400">Next Set</div>
          <div className="text-2xl font-bold text-[hsl(var(--primary))] mono">{formatTime(nextSetTime)}</div>
          <div className="text-sm text-gray-400">
            in {Math.ceil((nextSetTime.getTime() - currentTime.getTime()) / 1000)} seconds
          </div>
        </div>
      )}

      {isRunning && setTimes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold mb-2">Set Schedule</h4>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {setTimes.map((time, index) => {
              const isPast = time.getTime() < currentTime.getTime()
              const isNext = nextSetTime && time.getTime() === nextSetTime.getTime()

              return (
                <div
                  key={index}
                  className={`
                    p-2 rounded text-sm
                    ${isPast ? "bg-gray-800 text-gray-500" : ""}
                    ${isNext ? "bg-[hsl(var(--primary))/20] border border-[hsl(var(--primary))]" : ""}
                  `}
                >
                  <span className="font-bold">Set {index + 1}:</span> <span className="mono">{formatTime(time)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
