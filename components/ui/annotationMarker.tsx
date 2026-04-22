'use client'

import { cn } from '@/lib/utils'

interface MarkerProps {
  isActive?: boolean
  isSpawning?: boolean
  number?: number
  onClick?: () => void
}

// Design 5: Minimal Dot Marker - Super clean with expanding ring
export function MinimalDotMarker({
  isActive,
  isSpawning,
  number = 1,
  onClick,
}: MarkerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600/50 focus-visible:ring-offset-2 rounded-full'
      )}
    >
      {/* Expanding ring */}
      <span
        className={cn(
          'absolute w-8 h-8 rounded-full border-2 transition-all duration-300',
          isActive
            ? 'border-amber-500/60 scale-100 opacity-100'
            : 'border-amber-500/20 scale-75 opacity-0',
          isSpawning && 'animate-[circleExpand_0.35s_ease-out_forwards]'
        )}
      />

      {/* Main dot */}
      <span
        className={cn(
          'relative flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300',
          isActive
            ? 'bg-amber-600 scale-100'
            : 'bg-amber-600/35 scale-90 hover:bg-amber-600/50',
          isSpawning && 'animate-[popIn_0.3s_ease-out_forwards]'
        )}
      >
        <span
          className={cn(
            'text-[9px] font-bold transition-colors duration-300',
            isActive ? 'text-white' : 'text-amber-900/60'
          )}
        >
          {number}
        </span>
      </span>
    </button>
  )
}
