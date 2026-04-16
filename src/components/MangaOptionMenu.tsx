import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSidebar } from "~/components/ui/sidebar"; // adjust path if needed

import { useAppState } from "./AppStateProvider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Archive02Icon,
    LibraryIcon,
    BookBookmark02Icon,
    BookOpen02Icon,
    MoreHorizontalIcon,
    ClipboardCopyIcon,
    Link04Icon,
    Edit02Icon,
    Delete02Icon,
} from "@hugeicons/core-free-icons";
import Item from "./MangaOptionMenuItem";

type OptionMenuProps = {
    id: Id<"Manga">;
    type?: "ghost";
};

export default function AtaMangaOptionMenu({ id, type }: OptionMenuProps) {
    const manga = useQuery(api.manga.getMangaById, { id });
    const updateManga = useMutation(api.manga.updateManga);
    const deleteManga = useMutation(api.manga.deleteManga);
    const { toggleSidebar } = useSidebar();

    function copyValue(value: string) {
        navigator.clipboard.writeText(value);
    }

    const ItemStyle = "focus:bg-[--clr-primary-a10]";

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="rounded-full aspect-[1/1] h-6 p-1">
                        <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            size={16}
                            fill="white"
                            color="currentColor"
                            strokeWidth={1.5}
                        />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-56 bg-[--clr-surface-a10] backdrop-blur-md rounded-lg"
                    align="center"
                >
                    <Item
                        className={ItemStyle}
                        label="Copy Title"
                        icon={ClipboardCopyIcon}
                        action={() => copyValue(manga.display_title)}
                    />
                    <Item
                        className={ItemStyle}
                        label="Copy Link"
                        icon={Link04Icon}
                        action={() => copyValue(manga.site_url)}
                    />
                    <Item
                        className={ItemStyle}
                        label="Mark as reading"
                        icon={BookOpen02Icon}
                        action={() =>
                            updateManga({
                                id: manga._id,
                                data: { status: "reading" },
                            })
                        }
                    />
                    <Item
                        className={ItemStyle}
                        label="Mark as hiatus"
                        icon={BookBookmark02Icon}
                        action={() =>
                            updateManga({
                                id: manga._id,
                                data: { status: "hiatus" },
                            })
                        }
                    />
                    <Item
                        className={ItemStyle}
                        label="Mark as planned"
                        icon={LibraryIcon}
                        action={() =>
                            updateManga({
                                id: manga._id,
                                data: { status: "planned" },
                            })
                        }
                    />
                    <Item
                        className={ItemStyle}
                        label="Mark as archived"
                        icon={Archive02Icon}
                        action={() =>
                            updateManga({
                                id: manga._id,
                                data: { status: "archived" },
                            })
                        }
                    />
                    <Item
                        className={ItemStyle}
                        label="Edit Manga"
                        icon={Edit02Icon}
                        action={(e) => {
                            e.preventDefault();
                            toggleSidebar();
                        }}
                    />
                    <Item
                        className="focus:bg-[--clr-danger-a0] focus:text-white"
                        label="Delete"
                        icon={Delete02Icon}
                        action={() => deleteManga({ id: manga._id })}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}