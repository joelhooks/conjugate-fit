"use client";

import { useEffect } from "react";
import SimplifiedPlateVisualizer from "../simplified-plate-visualizer";

interface SetZoomViewProps {
  weights: number[];
  percentages: Record<number, number>;
  onClose: () => void;
}

/**
 * Fullscreen zoom view showing ALL sets in a scrollable list.
 * Large weight, percentage, and plate visualization for each set.
 */
export default function SetZoomView({
  weights,
  percentages,
  onClose,
}: SetZoomViewProps) {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Set zoom view"
    >
      {/* Header with close button - sticky */}
      <div className="sticky top-0 bg-black/90 backdrop-blur flex justify-end items-center p-4 z-10">
        <button
          type="button"
          onClick={onClose}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          aria-label="Close"
        >
          <span className="text-2xl leading-none">✕</span>
        </button>
      </div>

      {/* Scrollable set list */}
      <div className="flex-1 overflow-y-auto px-3 pb-6">
        <div className="flex flex-col gap-3">
          {weights.map((weight, index) => {
            const percentage = percentages[index];
            const setNumber = index + 1;

            return (
              <div
                key={`zoom-set-${weight}-${percentage || index}`}
                className="grid items-center border-b border-gray-800 pb-3 last:border-b-0"
                style={{
                  gridTemplateColumns: "2rem 1fr 5.5rem",
                  gap: "0.25rem",
                }}
              >
                {/* Set number - fixed width */}
                <span className="text-3xl font-bold text-gray-600">
                  {setNumber}
                </span>

                {/* Plate visualization - fills middle */}
                <div className="flex">
                  <SimplifiedPlateVisualizer
                    weight={weight}
                    scale={2}
                    hideBar
                  />
                </div>

                {/* Weight + percentage */}
                <div className="flex flex-col items-end justify-center pr-1">
                  <span className="text-4xl font-bold mono leading-none">
                    {weight}
                  </span>
                  {percentage && (
                    <span className="text-sm text-gray-500">{percentage}%</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
