'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * StaggerFade: staggered fade-in for a list of children.
 *
 * 80ms delay per item per ARCHITECTURE.md section 6.5. No spring, no y-movement. Under
 * reduced motion the delay collapses to zero and the opacity jumps straight to 1.
 */
import { motion } from 'motion/react';
import { Children } from 'react';
import { useReducedMotion } from './useReducedMotion';
export function StaggerFade({ delayMs = 80, durationMs = 180, children, ...rest }) {
    const reduced = useReducedMotion();
    return (_jsx("div", { ...rest, children: Children.toArray(children).map((child, index) => (_jsx(motion.div, { initial: reduced ? { opacity: 1 } : { opacity: 0 }, animate: { opacity: 1 }, transition: {
                duration: reduced ? 0 : durationMs / 1000,
                delay: reduced ? 0 : (index * delayMs) / 1000,
                ease: 'easeOut',
            }, children: child }, index))) }));
}
//# sourceMappingURL=StaggerFade.js.map