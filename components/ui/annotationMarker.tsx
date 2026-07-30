'use client'

import { cn } from '@/lib/utils'

interface MarkerProps {
  isActive?: boolean
  isSpawning?: boolean
  isFilled?: boolean
  number?: number
  onClick?: () => void
}

export function PillMarker({
  isActive,
  isSpawning,
  isFilled,
  number = 1,
  onClick,
}: MarkerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D3E9E]/50 focus-visible:ring-offset-2 rounded-full',
        isSpawning && 'animate-[scaleSpring_0.4s_ease-out_forwards]'
      )}
    >
      <span
        className={cn(
          'flex items-center rounded-full',
          'transition-[padding,background-color,box-shadow,border-color] duration-300',
          isActive
            ? 'px-2 py-1 bg-[#2D3E9E] shadow-md shadow-[#2D3E9E]/30 border border-transparent'
            : isFilled
              ? 'p-[6px] bg-[#2D3E9E]/70 border border-transparent'
              : 'p-[6px] bg-transparent border border-[#2D3E9E] hover:bg-[#2D3E9E]/10'
        )}
      >
        {/* Chevron — always visible, centered when inactive */}
        <svg
          width="8"
          height="6"
          viewBox="0 0 8 6"
          fill="none"
          className={cn(
            'flex-shrink-0 transition-colors duration-300',
            isActive || isFilled ? 'text-white' : 'text-[#2D3E9E]'
          )}
        >
          <path
            d="M1 5L4 2L7 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Number — fades in and expands when active */}
        <span
          className={cn(
            'text-[10px] font-semibold text-white overflow-hidden whitespace-nowrap',
            'transition-[opacity,max-width,margin-left] duration-300',
            isActive ? 'opacity-100 max-w-[20px] ml-1' : 'opacity-0 max-w-0 ml-0'
          )}
        >
          {number}
        </span>
      </span>
    </button>
  )
}
