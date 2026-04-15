import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import type { MouseEventHandler } from "react";

import { Button } from "~/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "~/components/ui/tooltip";

interface NavigationBarButtonProps {
    icon?: IconSvgElement;
    size?: number;
    color?: string;
    strokeWidth?: number;
    className?: string;
    iconClassName?: string;
    tooltip?: string;
    variant?:
        | "default"
        | "outline"
        | "ghost"
        | "destructive"
        | "secondary"
        | "link";
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function NavigationBarButton({
    icon,
    size = 24,
    color = "currentColor",
    strokeWidth = 1.5,
    className,
    iconClassName,
    tooltip,
    variant = "default",
    onClick,
}: NavigationBarButtonProps) {
    const button = (
        <Button
            className={`h-12 aspect-square rounded-full ${className ?? ""}`}
            variant={variant}
            onClick={onClick}>
            <HugeiconsIcon
                icon={icon}
                size={size}
                color={color}
                strokeWidth={strokeWidth}
                className={iconClassName}
            />
        </Button>
    );

    if (!tooltip) return button;

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    );
}
