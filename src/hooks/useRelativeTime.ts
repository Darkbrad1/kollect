// hooks/useRelativeTime.ts
import { useEffect, useState } from "react";
import { relativeTimeFromMs } from "../utils/relativeTimeFromMs";

export function useRelativeTime(tsMs: number, intervalMs: number = 1000) {
    const [relative, setRelative] = useState(() => relativeTimeFromMs(tsMs));

    useEffect(() => {
        const id = setInterval(() => {
            setRelative(relativeTimeFromMs(tsMs));
        }, intervalMs);

        return () => clearInterval(id);
    }, [tsMs, intervalMs]);

    return relative;
}
