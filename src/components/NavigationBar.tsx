import Button from "./NavigationBarButton";
import Search from "./NavigationBarSearch";
import StatusTabs from "./NavigationBarStatusTabs";
import { PanelRightIcon } from "@hugeicons/core-free-icons";
import { SidebarTrigger } from "~/components/ui/sidebar";

import "../styles/Custom.css";

export default function NavigationBar() {
    return (
        <div className="flex w-full justify-between">
            <Search />
            <StatusTabs />
            {/* <SidebarTrigger /> */}
            <SidebarTrigger
                variant="ghost"
                className= "custom-edge h-12 w-12 rounded-full border-none hover:bg-[--clr-surface-a20] hover:text-white bg-primary"
            />
            {/* <Button
                className="custom-edge hover:bg-[--clr-surface-a20]"
                icon={PanelRightIcon}
            /> */}
        </div>
    );
}
