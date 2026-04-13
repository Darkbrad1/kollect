import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

interface ItemProps {
    action?: ComponentProps<typeof DropdownMenuItem>["onSelect"];
    icon?: IconSvgElement;
    label?: string;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    iconClassName?: string;
}

export default function MangaOptionMenuItem({
    action,
    icon,
    label = "Default Label",
    size = 16,
    color = "currentColor",
    strokeWidth = 1.5,
    className,
    iconClassName,
}: ItemProps) {
    return (
        <DropdownMenuItem className={className} onSelect={action}>
            <HugeiconsIcon
                icon={icon}
                size={size}
                color={color}
                strokeWidth={strokeWidth}
                className={iconClassName}
            />
            {label}
        </DropdownMenuItem>
    );
}
