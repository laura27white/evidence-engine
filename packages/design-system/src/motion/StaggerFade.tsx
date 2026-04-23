'use client';

/**
 * StaggerFade: staggered fade-in for a list of children.
 *
 * 80ms delay per item per ARCHITECTURE.md section 6.5. No spring, no y-movement. Under
 * reduced motion the delay collapses to zero and the opacity jumps straight to 1.
 */
import { motion } from 'motion/react';
import { Children, type HTMLAttributes, type ReactNode } from 'react';

import { useReducedMotion } from './useReducedMotion';

export interface StaggerFadeProps extends HTMLAttributes<HTMLDivElement> {
  /** Per-item delay in ms. Defaults to 80. */
  delayMs?: number;
  /** Total animation duration per item in ms. Defaults to 180. */
  durationMs?: number;
  children: ReactNode;
}

export function StaggerFade({
  delayMs = 80,
  durationMs = 180,
  children,
  ...rest
}: StaggerFadeProps): JSX.Element {
  const reduced = useReducedMotion();
  return (
    <div {...rest}>
      {Children.toArray(children).map((child, index) => (
        <motion.div
          key={index}
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: reduced ? 0 : durationMs / 1000,
            delay: reduced ? 0 : (index * delayMs) / 1000,
            ease: 'easeOut',
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
