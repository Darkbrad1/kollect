import Button from "./NavigationBarButton";
import Search from './NavigationBarSearch'
import StatusTabs from "./NavigationBarStatusTabs";
import {PanelRightIcon } from "@hugeicons/core-free-icons";
import "../styles/Custom.css";

export default function NavigationBar() {

    return (
        <div className="flex w-full justify-between p-2">
            <Search />
            <StatusTabs />
            <Button
                className="custom-edge hover:bg-[--clr-surface-a20]"
                icon={PanelRightIcon}
            />
        </div>
    );
}
