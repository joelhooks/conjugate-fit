"use client"

import { useEffect, useState } from "react"
import { useSpinDelay } from "spin-delay"

interface MemphisLoaderScreenProps {
  isLoading: boolean
  minDuration?: number
  delay?: number
}

export default function MemphisLoaderScreen({ isLoading, minDuration = 1200, delay = 0 }: MemphisLoaderScreenProps) {
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("LOADING")

  // Use spin delay to ensure the loader is shown for a minimum duration
  const showLoader = useSpinDelay(isLoading, {
    delay,
    minDuration,
  })

  // Animate the shapes
  useEffect(() => {
    if (!showLoader) return

    // Rotate shapes
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 3) % 360)
    }, 30)

    // Pulse scale
    const scaleInterval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.05 : 1))
    }, 800)

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + 1
      })
    }, 30)

    // Loading text animation
    const textInterval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev === "LOADING") return "LOADING."
        if (prev === "LOADING.") return "LOADING.."
        if (prev === "LOADING..") return "LOADING..."
        return "LOADING"
      })
    }, 400)

    return () => {
      clearInterval(rotationInterval)
      clearInterval(scaleInterval)
      clearInterval(progressInterval)
      clearInterval(textInterval)
    }
  }, [showLoader])

  if (!showLoader) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,_hsl(var(--primary))_1px,_transparent_1px),radial-gradient(circle,_hsl(var(--secondary))_1px,_transparent_1px)]"
        style={{ backgroundSize: "20px 20px", backgroundPosition: "0 0, 10px 10px" }}
      ></div>

      {/* Zigzag pattern top */}
      <div className="absolute top-0 left-0 right-0 h-8 overflow-hidden">
        <svg width="100%" height="8">
          <path
            d="M0,0 L20,8 L40,0 L60,8 L80,0 L100,8 L120,0 L140,8 L160,0 L180,8 L200,0 L220,8 L240,0 L260,8 L280,0 L300,8 L320,0"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            fill="none"
            style={{
              strokeDasharray: "320",
              strokeDashoffset: "320",
              animation: "dash 15s linear infinite",
            }}
          />
        </svg>
      </div>

      {/* Zigzag pattern bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 overflow-hidden">
        <svg width="100%" height="8" className="transform rotate-180">
          <path
            d="M0,0 L20,8 L40,0 L60,8 L80,0 L100,8 L120,0 L140,8 L160,0 L180,8 L200,0 L220,8 L240,0 L260,8 L280,0 L300,8 L320,0"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            fill="none"
            style={{
              strokeDasharray: "320",
              strokeDashoffset: "320",
              animation: "dash 10s linear infinite reverse",
            }}
          />
        </svg>
      </div>

      <div className="relative w-80 h-80">
        {/* Decorative elements */}
        <div
          className="absolute w-full h-full rounded-full border-4 border-dashed border-[hsl(var(--primary))]"
          style={{
            transform: `rotate(${rotation * 0.5}deg)`,
            opacity: 0.3,
          }}
        ></div>

        {/* Rotating square */}
        <div
          className="absolute top-1/2 left-1/2 w-48 h-48 border-4 border-[hsl(var(--primary))]"
          style={{
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: "center",
          }}
        ></div>

        {/* Pulsing circle */}
        <div
          className="absolute top-1/2 left-1/2 w-36 h-36 bg-[hsl(var(--secondary))] rounded-full"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            transition: "transform 0.5s ease-in-out",
            opacity: 0.7,
          }}
        ></div>

        {/* Rotating triangle */}
        <div
          className="absolute top-1/2 left-1/2 w-0 h-0"
          style={{
            transform: `translate(-50%, -50%) rotate(${-rotation * 1.5}deg)`,
            transformOrigin: "center",
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: "60px solid hsl(var(--accent))",
            opacity: 0.8,
          }}
        ></div>

        {/* Small decorative shapes */}
        <div
          className="absolute w-12 h-12 bg-[hsl(var(--primary))] rounded-full"
          style={{
            top: `${Math.sin(rotation * 0.01) * 30 + 20}%`,
            left: `${Math.cos(rotation * 0.01) * 30 + 20}%`,
            opacity: 0.5,
          }}
        ></div>

        <div
          className="absolute w-8 h-8 bg-[hsl(var(--accent))]"
          style={{
            top: `${Math.cos(rotation * 0.01) * 30 + 70}%`,
            left: `${Math.sin(rotation * 0.01) * 30 + 70}%`,
            transform: `rotate(${rotation * 2}deg)`,
            opacity: 0.6,
          }}
        ></div>

        <div
          className="absolute w-0 h-0"
          style={{
            top: `${Math.sin(rotation * 0.02) * 20 + 30}%`,
            left: `${Math.cos(rotation * 0.02) * 20 + 70}%`,
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderBottom: "25px solid hsl(var(--secondary))",
            opacity: 0.7,
          }}
        ></div>

        {/* Central content */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
          <h1 className="text-5xl font-bold mb-4 text-white">
            <span className="text-[hsl(var(--primary))]">CONJUGATE</span>
            <br />
            <span className="text-outline">FITNESS</span>
          </h1>
          <div className="text-2xl font-bold text-white mono tracking-widest">{loadingText}</div>

          {/* Progress bar */}
          <div className="mt-4 w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[hsl(var(--primary))]"
              style={{ width: `${progress}%`, transition: "width 0.1s ease-out" }}
            ></div>
          </div>
        </div>

        {/* Animated dots */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-3">
          <div className="w-3 h-3 bg-[hsl(var(--primary))] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[hsl(var(--secondary))] rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-[hsl(var(--accent))] rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-16 h-16">
        <div className="absolute w-full h-1 bg-[hsl(var(--primary))]"></div>
        <div className="absolute w-1 h-full bg-[hsl(var(--primary))]"></div>
      </div>

      <div className="absolute top-4 right-4 w-16 h-16">
        <div className="absolute w-full h-1 bg-[hsl(var(--accent))]"></div>
        <div className="absolute right-0 w-1 h-full bg-[hsl(var(--accent))]"></div>
      </div>

      <div className="absolute bottom-4 left-4 w-16 h-16">
        <div className="absolute bottom-0 w-full h-1 bg-[hsl(var(--secondary))]"></div>
        <div className="absolute w-1 h-full bg-[hsl(var(--secondary))]"></div>
      </div>

      <div className="absolute bottom-4 right-4 w-16 h-16">
        <div className="absolute bottom-0 w-full h-1 bg-[hsl(var(--primary))]"></div>
        <div className="absolute right-0 w-1 h-full bg-[hsl(var(--primary))]"></div>
      </div>
    </div>
  )
}
