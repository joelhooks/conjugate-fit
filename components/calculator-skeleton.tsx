"use client"

export default function CalculatorSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto animate-pulse">
      {/* Mode selector skeleton - exact height match */}
      <div className="flex justify-between mb-6 gap-2">
        <div className="flex-1 h-[72px] bg-gray-800 rounded-lg"></div>
        <div className="flex-1 h-[72px] bg-gray-800 rounded-lg"></div>
      </div>

      {/* Bar weight selector skeleton - exact height match */}
      <div className="mb-6">
        <div className="h-[60px] bg-gray-800 rounded-lg"></div>
      </div>

      {/* Weight input skeleton - exact height match */}
      <div className="space-y-2 mb-6">
        <div className="h-7 w-48 bg-gray-800 rounded"></div>
        <div className="h-20 bg-gray-800 rounded-lg"></div>
      </div>

      {/* Scheme selector skeleton (for 1RM mode) - exact height match */}
      <div className="h-[60px] bg-gray-800 rounded-lg mb-6"></div>

      {/* Results placeholder - maintains space for results */}
      <div className="mt-6 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <div className="h-7 w-24 bg-gray-800 rounded"></div>
          <div className="h-8 w-20 bg-gray-800 rounded"></div>
        </div>

        {/* Placeholder for 3 result items with exact heights */}
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 p-2 rounded-lg h-[72px]"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
