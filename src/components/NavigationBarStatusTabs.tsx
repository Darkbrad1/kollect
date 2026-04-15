import { useState } from "react";
import NavButton from "./NavigationBarButton";
import {
    Archive02Icon,
    LibraryIcon,
    BookBookmark02Icon,
    BookOpen02Icon,
} from "@hugeicons/core-free-icons";
import { useAppState } from "./AppStateProvider"

export default function NavigationBarStatusTabs() {
    const { status, setStatus } = useAppState()

    return (
        <div className="rounded-full bg-[--clr-surface-a10] custom-edge status-wrapper">
            <div className="bubble active"></div>

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === "reading" ? "active" : ""
                }`}
                variant="ghost"
                icon={BookOpen02Icon}
                onClick={() => setStatus("reading")}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === "planned" ? "active" : ""
                }`}
                variant="ghost"
                icon={LibraryIcon}
                onClick={() => setStatus("planned")}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === "hiatus" ? "active" : ""
                }`}
                variant="ghost"
                icon={BookBookmark02Icon}
                onClick={() => setStatus("hiatus")}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === "archived" ? "active" : ""
                }`}
                variant="ghost"
                icon={Archive02Icon}
                onClick={() => setStatus("archived")}
            />
        </div>
    );
}
