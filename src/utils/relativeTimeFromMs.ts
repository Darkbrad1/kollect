
export function relativeTimeFromMs(
    tsMs: number,
    nowMs: number = Date.now()
): string {
    type TimeUnit =
        | "second"
        | "minute"
        | "hour"
        | "day"
        | "week"
        | "month"
        | "year";
    function formatRelative(
        n: number,
        unit: TimeUnit,
        isFuture: boolean
    ): string {
        const plural = n === 1 ? "" : "s";
        return isFuture
            ? `in ${n} ${unit}${plural}`
            : `${n} ${unit}${plural} ago`;
    }
    function getMonthsDiff(from: Date, to: Date): number {
        let months =
            (to.getFullYear() - from.getFullYear()) * 12 +
            (to.getMonth() - from.getMonth());

        // Adjust if we haven't fully reached the day-of-month yet
        const anchor = new Date(from);
        anchor.setMonth(from.getMonth() + months);
        if (anchor > to) months--;

        return months;
    }

    const then = new Date(tsMs);
    const now = new Date(nowMs);
    const isFuture = tsMs > nowMs;
    const [from, to] = isFuture ? [now, then] : [then, now];
    const months = getMonthsDiff(from, to);

    // Years / months (calendar-based)
    if (months >= 12) {return formatRelative(Math.floor(months / 12), "year", isFuture);}
    if (months >= 1) { return formatRelative(months, "month", isFuture);}

    // Weeks / days / hours / minutes / seconds (fixed-duration)
    const diffMs = Math.abs(nowMs - tsMs);
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (weeks >= 1) return formatRelative(weeks, "week", isFuture);
    if (days >= 1) return formatRelative(days, "day", isFuture);
    if (hours >= 1) return formatRelative(hours, "hour", isFuture);
    if (minutes >= 1) return formatRelative(minutes, "minute", isFuture);
    return formatRelative(seconds, "second", isFuture);
}