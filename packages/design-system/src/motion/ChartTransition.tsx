'use client';

/**
 * ChartTransition: 250ms ease-out transition for chart state changes.
 *
 * Wrap a chart container in ChartTransition so that when its `transitionKey` changes
 * (filter switched, series changed) the new content crossfades into place. Reduced
 * motion replaces the crossfade with an instant swap.
 */
import { AnimatePresence, motion } from 'motion/react';
import { type HTMLAttributes, type ReactNode } from 'react';

import { useReducedMotion } from './useReducedMotion';

export interface ChartTransitionProps extends HTMLAttributes<HTMLDivElement> {
  /** Unique key for the current chart state. Changing this triggers the transition. */
  transitionKey: string | number;
  children: ReactNode;
}

export function ChartTransition({
  transitionKey,
  children,
  ...rest
}: ChartTransitionProps): JSX.Element {
  const reduced = useReducedMotion();
  return (
    <div {...rest}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={transitionKey}
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
