'use client';
import { jsx as _jsx } from "react/jsx-runtime";
/**
 * ChartTransition: 250ms ease-out transition for chart state changes.
 *
 * Wrap a chart container in ChartTransition so that when its `transitionKey` changes
 * (filter switched, series changed) the new content crossfades into place. Reduced
 * motion replaces the crossfade with an instant swap.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from './useReducedMotion';
export function ChartTransition({ transitionKey, children, ...rest }) {
    const reduced = useReducedMotion();
    return (_jsx("div", { ...rest, children: _jsx(AnimatePresence, { mode: "wait", initial: false, children: _jsx(motion.div, { initial: reduced ? { opacity: 1 } : { opacity: 0 }, animate: { opacity: 1 }, exit: reduced ? { opacity: 1 } : { opacity: 0 }, transition: { duration: reduced ? 0 : 0.25, ease: 'easeOut' }, children: children }, transitionKey) }) }));
}
//# sourceMappingURL=ChartTransition.js.map