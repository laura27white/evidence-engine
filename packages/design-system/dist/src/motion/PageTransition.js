'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * PageTransition: minimal crossfade on route change.
 *
 * Wraps the page content so Next.js route transitions crossfade rather than hard-swap.
 * Reduced motion collapses to no animation.
 */
import { motion } from 'motion/react';
import { useReducedMotion } from './useReducedMotion';
export function PageTransition({ pathname, children, className, style, }) {
    const reduced = useReducedMotion();
    return (_jsx(motion.div, { className: className, style: style, initial: reduced ? { opacity: 1 } : { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: reduced ? 0 : 0.2, ease: 'easeOut' }, children: children }, pathname));
}
//# sourceMappingURL=PageTransition.js.map