import Search from "./NavigationBarSearch";
import StatusTabs from "./NavigationBarStatusTabs";
import { Settings01Icon } from "@hugeicons/core-free-icons";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { useClerk } from "@clerk/chrome-extension";
import { useState } from "react";

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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="custom-edge hover:bg-[--clr-surface-a20] bg-[--clr-surface-a10] h-12 aspect-square rounded-full hover:text-white"
                    >
                        <HugeiconsIcon icon={Settings01Icon} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="flex items-center justify-between px-2 py-2">
                        <Label htmlFor="dark-mode">Dark Mode</Label>
                        <Switch
                            id="dark-mode"
                            checked={darkMode}
                            onCheckedChange={handleDarkMode}
                        />
                    </div>
                    <div className="flex items-center justify-between px-2 py-2">
                        <Label htmlFor="progress-bar">Show Progress Bar</Label>
                        <Switch
                            id="progress-bar"
                            checked={showProgressBar}
                            onCheckedChange={setShowProgressBar}
                        />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-500 focus:text-red-500 cursor-pointer"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}