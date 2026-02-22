'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedContainerProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  duration?: number
  once?: boolean
}

const directionVariants = {
  up: { hidden: { y: 40, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  down: { hidden: { y: -40, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  left: { hidden: { x: -40, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  right: { hidden: { x: 40, opacity: 0 }, visible: { x: 0, opacity: 1 } },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
}

export default function AnimatedContainer({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}: AnimatedContainerProps) {
  const variants = directionVariants[direction]

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once }}
      variants={variants}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger container for children
export function StaggerContainer({ children, className = '', stagger = 0.1 }: { children: ReactNode; className?: string; stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
