'use client'

import { cn } from '@/lib/utils'

interface MarkerProps {
  isActive?: boolean
  isSpawning?: boolean
  number?: number
  onClick?: () => void
}

// Design 6: Pill Marker - Horizontal pill shape
export function PillMarker({
  isActive,
  isSpawning,
  number = 1,
  onClick,
}: MarkerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:ring-offset-2 rounded-full',
        isSpawning && 'animate-[scaleSpring_0.4s_ease-out_forwards]'
      )}
    >
      {/* Pill shape */}
      <span
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-300',
          isActive
            ? 'bg-amber-600 shadow-md shadow-amber-600/30'
            : 'bg-amber-600/30 hover:bg-amber-600/50'
        )}
      >
        {/* Dot indicator */}
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-all duration-300',
            isActive ? 'bg-amber-200' : 'bg-amber-700/50'
          )}
        />
        {/* Number */}
        <span
          className={cn(
            'text-[10px] font-semibold transition-colors duration-300',
            isActive ? 'text-white' : 'text-amber-900/60'
          )}
        >
          {number}
        </span>
      </span>
    </button>
  )
}
