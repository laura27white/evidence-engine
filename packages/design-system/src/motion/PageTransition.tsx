'use client';

/**
 * PageTransition: minimal crossfade on route change.
 *
 * Wraps the page content so Next.js route transitions crossfade rather than hard-swap.
 * Reduced motion collapses to no animation.
 */
import { motion } from 'motion/react';
import { type CSSProperties, type ReactNode } from 'react';

import { useReducedMotion } from './useReducedMotion';

export interface PageTransitionProps {
  /** Unique key for the page, typically the pathname. */
  pathname: string;
  children: ReactNode;
  /** Optional class name applied to the wrapping div. */
  className?: string;
  /** Optional style applied to the wrapping div. */
  style?: CSSProperties;
}

export function PageTransition({
  pathname,
  children,
  className,
  style,
}: PageTransitionProps): JSX.Element {
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={pathname}
      className={className}
      style={style}
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
