'use client'

import { motion } from 'motion/react'

interface MotionEffectProps {
  children: React.ReactNode
  delay?: number
}

export function MotionEffect({ children, delay = 0 }: MotionEffectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  )
}
