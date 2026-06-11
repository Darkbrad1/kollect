import NavButton from "./NavigationBarButton";
import { tabs } from "~/settings/appSetting";
import {
    Archive02Icon,
    LibraryIcon,
    BookBookmark02Icon,
    BookOpen02Icon,
} from "@hugeicons/core-free-icons";
import { useAppState } from "./AppStateProvider";

export default function NavigationBarStatusTabs() {
    const { status, setStatus } = useAppState();
    const sw = (s: string) => (status === s ? 2.1 : 1.5);
    return (
        <div className="rounded-full bg-[--clr-surface-a10] custom-edge status-wrapper">
            <div className="bubble active"></div>

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === tabs[0] ? "active" : ""
                }`}
                variant="ghost"
                icon={BookOpen02Icon}
                // strokeWidth={strokeWidth}
                strokeWidth={sw(tabs[0])}
                onClick={() => setStatus(tabs[0])}
                tooltip={tabs[0]}

            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === tabs[1] ? "active" : ""
                }`}
                variant="ghost"
                icon={LibraryIcon}
                strokeWidth={sw(tabs[1])}
                onClick={() => setStatus(tabs[1])}
                tooltip={tabs[1]}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === tabs[2] ? "active" : ""
                }`}
                variant="ghost"
                icon={BookBookmark02Icon}
                strokeWidth={sw(tabs[2])}
                onClick={() => setStatus(tabs[2])}
                tooltip={tabs[2]}
            />

            <NavButton
                className={`hover:bg-[--clr-surface-a20] status-tab hover:text-[white] ${
                    status === tabs[3] ? "active" : ""
                }`}
                variant="ghost"
                icon={Archive02Icon}
                strokeWidth={sw(tabs[3])}
                onClick={() => setStatus(tabs[3])}
                tooltip={tabs[3]}

            />
        </div>
    );
}
