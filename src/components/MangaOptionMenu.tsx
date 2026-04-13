import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
    Archive,
    BookMarked,
    BookOpenText,
    Copy,
    EllipsisVertical,
    LibraryBig,
    Link,
    SquarePen,
    Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import EditSheet from "./EditSheet";
import { useAppState } from "./AppStateProvider"; // adjust path if needed
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
    const [editOpen, setEditOpen] = useState(false);
    const manga = useQuery(api.manga.getMangaById, { id });
    const updateManga = useMutation(api.manga.updateManga);
    const deleteManga = useMutation(api.manga.deleteManga);

    function copyValue(value: string) {
        navigator.clipboard.writeText(value);
    }
    const ItemStyle = "focus:bg-[--clr-primary-a10]";
    return (
        <>
            <EditSheet
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                data={manga}
            />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="rounded-full aspect-[1/1] h-6 p-1 ">
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
                    className="w-56 bg-[--clr-surface-a20]/20 backdrop-blur-md rounded-lg"
                    align="center">
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
                            setEditOpen(true);
                        }}
                    />
                    <Item
                        className={ItemStyle}
                        label="Delete"
                        icon={Delete02Icon}
                        action={() => deleteManga({ id: manga._id })}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
