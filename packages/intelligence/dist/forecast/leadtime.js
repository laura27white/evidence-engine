/**
 * Lead time: floored days between "now" and the projected breach date.
 */
export function computeLeadTime(breachDate, now) {
    if (breachDate === null)
        return null;
    const diffMs = breachDate.getTime() - now.getTime();
    return Math.floor(diffMs / 86_400_000);
}
//# sourceMappingURL=leadtime.js.map