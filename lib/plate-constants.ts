// Standard plate weights in pounds
export const STANDARD_PLATES = [45, 25, 15, 10, 5, 2.5]

export const ALL_AVAILABLE_PLATES = [55, 45, 35, 25, 15, 10, 5, 2.5]

// Default selected plates (standard gym set)
export const DEFAULT_SELECTED_PLATES = [45, 35, 25, 15, 10, 5, 2.5]

// Color mapping for different plate weights
export const PLATE_COLORS: Record<number, string> = {
  55: "bg-red-600", // 55lb bumper - red
  45: "bg-blue-600",
  35: "bg-yellow-500", // 35lb bumper - yellow
  25: "bg-green-600",
  15: "bg-orange-500",
  10: "bg-gray-300",
  5: "bg-red-300",
  2.5: "bg-blue-300",
  // Keep the explicit colors for smaller plates
  1.25: "bg-purple-400",
  1: "bg-pink-400",
  0.5: "bg-indigo-400",
  0.25: "bg-cyan-400",
}

export const PLATE_TEXT_COLORS: Record<number, string> = {
  55: "text-white",
  45: "text-white",
  35: "text-black",
  25: "text-white",
  15: "text-black",
  10: "text-black",
  5: "text-black",
  2.5: "text-black",
  1.25: "text-black",
  1: "text-black",
  0.5: "text-white",
  0.25: "text-black",
}

export const PLATE_THICKNESS: Record<number, number> = {
  55: 28, // Thickest bumper
  45: 24,
  35: 20,
  25: 18,
  15: 14,
  10: 12,
  5: 10,
  2.5: 16, // Metal plate, slightly wider for visibility
}

export const PLATE_HEIGHTS: Record<number, number> = {
  55: 40, // Full bumper height
  45: 40,
  35: 40,
  25: 40,
  15: 40,
  10: 40, // 10lb bumpers are same height
  5: 28, // Change plates are smaller
  2.5: 22,
}

// Fixed width mapping for each plate weight (proportional to actual weight)
// Ensuring minimum widths for smaller plates so labels fit
export const PLATE_WIDTHS: Record<number, number> = {
  55: 110,
  45: 100, // Widest plate
  35: 80,
  25: 60,
  15: 40,
  10: 32,
  5: 26,
  2.5: 20, // Narrowest plate
  // Add explicit widths for smaller plates
  1.25: 18,
  1: 16,
  0.5: 14,
  0.25: 12,
}

// Height multiplier for plates (smaller to reduce vertical space)
export const PLATE_HEIGHT_MULTIPLIER = 0.5

// Standard bar weights
export const BAR_WEIGHTS = [45, 35, 15]

// Default bar weight
export const DEFAULT_BAR_WEIGHT = 45
