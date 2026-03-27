import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~components/ui/dropdown-menu";
import {
    EllipsisVertical,
    Copy,
    Link,
    BookOpenText,
    BookMarked,
    LibraryBig,
    Archive,
    SquarePen,
    Trash2,
} from "lucide-react";

import { useState } from "react";
import { Button } from "~components/ui/button";
import EditSheet from "./EditSheet";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
// import { useUser } from "@clerk/clerk-react";


type OptionMenuProps = {
    data: Doc<"Manga">;
    type?: "ghost";
};

export default function MangaOptionMenu({ data, type }: OptionMenuProps) {
    // data is used to get data about the manga that was selected
    // const [editOpen, setEditOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const updateManga = useMutation(api.manga.updateManga);
    const deleteManga = useMutation(api.manga.deleteManga);
    // const {user} = useUser();
    function CopyValue(value: string) {
        navigator.clipboard.writeText(value);
    }
    const iconHoverStyle = "focus:text-accent-foreground"
    // if(!user){
    //     return <>{console.error("No user Signed In")}</>
    // }
    return (
        <>
            {/* 1) The Sheet lives here and is controlled by state */}
            <EditSheet
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                data={data}
            />

            {/* 2) Your dropdown menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        className={`options [grid-area:manga] rounded-lg hover:bg-zinc-800 bg-zinc-800/50 m-1 ${type === "ghost" ? "invisible self-start" : "self-center hover:bg-zinc-700"}`}>
                        <EllipsisVertical />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="center">
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => CopyValue(data.display_title)}>
                            <Copy className={iconHoverStyle} />
                            Copy Title

                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={() => CopyValue(data.site_url)}>
                            <Link className={iconHoverStyle}/>
                            Copy Link

                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() =>
                                updateManga({
                                    id: data._id,
                                    data: { status: "reading" },
                                })
                            }>
                            <BookOpenText className={iconHoverStyle}/>
                            Mark as reading

                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={() =>
                                updateManga({
                                    id: data._id,
                                    data: { status: "hiatus" },
                                })
                            }>
                            <BookMarked className={iconHoverStyle}/>
                            Mark as haitus

                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={() =>
                                updateManga({
                                    id: data._id,
                                    data: { status: "planned" },
                                })
                            }>
                            <LibraryBig className={iconHoverStyle}/>
                            Mark as planned

                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onSelect={() =>
                                updateManga({
                                    id: data._id,
                                    data: { status: "archived" },
                                })
                            }>
                            <Archive className={iconHoverStyle}/>
                            Mark as archieved

                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        {/* 3) This opens the Sheet */}
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                setEditOpen(true);
                            }}>
                            <SquarePen className={iconHoverStyle}/>
                            Edit Manga
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-destructive focus:bg-destructive"
                        onSelect={() => deleteManga({ id: data._id})}>
                        <Trash2 className={iconHoverStyle}/>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
