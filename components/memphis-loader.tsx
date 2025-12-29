"use client"

import { useEffect, useState } from "react"
import { useSpinDelay } from "spin-delay"
import { useIsLoading } from "@/lib/stores/ui-store"

interface MemphisLoaderProps {
  isLoading?: boolean
  minDuration?: number
  delay?: number
}

export default function MemphisLoader({
  isLoading: propIsLoading,
  minDuration = 500,
  delay = 300,
}: MemphisLoaderProps) {
  const [rotation, setRotation] = useState(0)
  const storeIsLoading = useIsLoading()
  const isLoading = propIsLoading !== undefined ? propIsLoading : storeIsLoading

  const showLoader = useSpinDelay(isLoading, {
    delay,
    minDuration,
  })

  // Animate the shapes
  useEffect(() => {
    if (!showLoader) return

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 5) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [showLoader])

  if (!showLoader) return null

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative w-56 h-56">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_hsl(var(--primary))_1px,_transparent_1px),radial-gradient(circle,_hsl(var(--secondary))_1px,_transparent_1px)]"
          style={{ backgroundSize: "20px 20px", backgroundPosition: "0 0, 10px 10px" }}
        ></div>

        {/* Rotating square */}
        <div
          className="absolute top-1/2 left-1/2 w-36 h-36 border-4 border-[hsl(var(--primary))]"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        ></div>

        {/* Pulsing circle */}
        <div
          className="absolute top-1/2 left-1/2 w-28 h-28 bg-[hsl(var(--secondary))] rounded-full animate-pulse"
          style={{ transform: "translate(-50%, -50%)" }}
        ></div>

        {/* Bouncing triangle */}
        <div
          className="absolute"
          style={{
            top: `calc(50% - 20px + ${Math.sin(rotation * 0.05) * 10}px)`,
            left: "50%",
            transform: "translateX(-50%)",
            width: "0",
            height: "0",
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderBottom: "40px solid hsl(var(--accent))",
          }}
        ></div>

        {/* Zigzag line */}
        <svg className="absolute top-1/2 left-0 w-full" style={{ transform: "translateY(-50%)" }}>
          <path
            d="M0,0 L20,10 L40,-10 L60,10 L80,-10 L100,10 L120,-10 L140,10 L160,-10 L180,10 L200,-10"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transform: `translateX(${(rotation % 40) - 20}px)` }}
          />
        </svg>

        {/* Small dots that fade in and out in sequence */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-2 h-2 bg-[hsl(var(--primary))] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[hsl(var(--secondary))] rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-[hsl(var(--accent))] rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  )
}
