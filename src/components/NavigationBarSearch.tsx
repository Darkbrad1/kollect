import { Input } from "~/components/ui/input";
import { Search01Icon } from "@hugeicons/core-free-icons";
import NavButton from "./NavigationBarButton";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "./AppStateProvider"


export default function NavigationBarSearch() {
    const [searchOpen, setSearchOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { search, setSearch } = useAppState();

    useEffect(() => {
        if (searchOpen) {
            requestAnimationFrame(() => {
                inputRef.current?.focus();
            });
        }
    }, [searchOpen]);

    return (
        <div className="custom-edge flex items-center rounded-full bg-[--clr-surface-a10]">
            <NavButton
                className="bg-transparent hover:bg-[--clr-surface-a20]"
                icon={Search01Icon}
                onClick={() => setSearchOpen((prev) => !prev)}
            />
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    searchOpen ? "max-w-[200px]" : "max-w-0"
                }`}>
                <Input
                    ref={inputRef}
                    placeholder="Search..."
                    onBlur={() => setSearchOpen(false)}
                    style={{ outline: "none", boxShadow: "none" }}
                    onChange={(e) =>
                        // Update search state in lowercase for case-insensitive matching
                        setSearch(e.target.value)
                    }
                    className="h-full w-[200px] rounded-full border-0 bg-transparent shadow-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                />
            </div>
        </div>
    );
}
