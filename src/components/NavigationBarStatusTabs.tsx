import { useState } from "react";
import NavButton from "./NavigationBarButton";
import {
    Archive02Icon,
    LibraryIcon,
    BookBookmark02Icon,
    BookOpen02Icon,
} from "@hugeicons/core-free-icons";
import { useAppState } from "./AppStateProvider";
import { s } from "react-router/dist/development/instrumentation-BYr6ff5D";

export default function NavigationBarStatusTabs() {
    const { status, setStatus } = useAppState();
    const sw = (s: string) => (status === s ? 2.1 : 1.5);
    const reading = "reading"
    const hiatus = "hiatus"
    const planned = "planned"
    const archived = "archived"
    return (
        <div className="rounded-full bg-[--clr-surface-a10] custom-edge status-wrapper">
            <div className="bubble active"></div>

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === reading ? "active" : ""
                }`}
                variant="ghost"
                icon={BookOpen02Icon}
                // strokeWidth={strokeWidth}
                strokeWidth={sw(reading)}
                onClick={() => setStatus(reading)}
                tooltip={reading}

            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === planned ? "active" : ""
                }`}
                variant="ghost"
                icon={LibraryIcon}
                strokeWidth={sw(planned)}
                onClick={() => setStatus(planned)}
                tooltip={planned}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === hiatus ? "active" : ""
                }`}
                variant="ghost"
                icon={BookBookmark02Icon}
                strokeWidth={sw(hiatus)}
                onClick={() => setStatus(hiatus)}
                tooltip={hiatus}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === archived ? "active" : ""
                }`}
                variant="ghost"
                icon={Archive02Icon}
                strokeWidth={sw(archived)}
                onClick={() => setStatus(archived)}
                tooltip={archived}

            />
        </div>
    );
}
