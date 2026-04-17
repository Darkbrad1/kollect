import Search from "./NavigationBarSearch";
import StatusTabs from "./NavigationBarStatusTabs";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { useClerk, UserButton } from "@clerk/chrome-extension";
import { useState } from "react";
// import { UserButton } from "@clerk/chrome-extension";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

import "../styles/Custom.css";

export default function NavigationBar() {
    const { signOut } = useClerk();
    const [darkMode, setDarkMode] = useState(false);
    const [showProgressBar, setShowProgressBar] = useState(false);

    const handleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
        // wire up your dark mode logic here
    };

    return (
        <div className="flex w-full justify-between">
            <Search />
            <StatusTabs />
            {/* <UserButton  /> */}
            <UserButton
                appearance={{
                    elements: {
                        avatarBox: "w-11 h-11", // or any size e.g. "w-12 h-12"
                    },
                }}
            />
        </div>
    );
}
