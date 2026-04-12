import { useState } from "react";
import NavButton from "./NavigationBarButton";
import {
    Archive02Icon,
    LibraryIcon,
    BookBookmark02Icon,
    BookOpen02Icon,
} from "@hugeicons/core-free-icons";
type Tab = "reading" | "bookmarks" | "library" | "archive";

export default function NavigationBarStatusTabs() {
    const [activeTab, setActiveTab] = useState<Tab>("reading");

    return (
        <div className="rounded-full bg-[--clr-surface-a10] custom-edge status-wrapper">
            <div className="bubble active"></div>

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    activeTab === "reading" ? "active" : ""
                }`}
                variant="ghost"
                icon={BookOpen02Icon}
                onClick={() => setActiveTab("reading")}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    activeTab === "bookmarks" ? "active" : ""
                }`}
                variant="ghost"
                icon={BookBookmark02Icon}
                onClick={() => setActiveTab("bookmarks")}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    activeTab === "library" ? "active" : ""
                }`}
                variant="ghost"
                icon={LibraryIcon}
                onClick={() => setActiveTab("library")}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    activeTab === "archive" ? "active" : ""
                }`}
                variant="ghost"
                icon={Archive02Icon}
                onClick={() => setActiveTab("archive")}
            />
        </div>
    );
}
