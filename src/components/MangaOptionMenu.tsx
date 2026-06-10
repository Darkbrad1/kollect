import { api } from "convex/_generated/api";
import type { UserMangaPayload, MangaStatus } from "~/lib/manga/types";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useSidebar } from "~/components/ui/sidebar";

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
} from '@hugeicons/core-free-icons';
import Item from "./MangaOptionMenuItem";
// import { toast } from "sonner";

type OptionMenuProps = {
  id: Id<"userMangas">;
  type?: "ghost";
};

export default function MenuOptionTriggered({ id, type }: OptionMenuProps) {
  const { setTarget } = useAppState();
  const manga: UserMangaPayload = useQuery(api.manga.getManga, { id });
  const updateManga = useMutation(api.manga.updateManga);
  const deleteManga = useMutation(api.manga.deleteManga);
  const { toggleSidebar } = useSidebar();

  if (!manga) return null;

  function copyValue(value: string, message?: string) {
    navigator.clipboard.writeText(value);
    toast.success(message);
  }

  function update(status: MangaStatus) {
    updateManga({
      id: manga.id,
      data: { status: status },
    });
  }

  const ItemStyle = "focus:bg-[--clr-primary-a10]";

  return (
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

      <DropdownMenuContent className="w-56 bg-[--clr-surface-a10] backdrop-blur-md rounded-lg" align="center" >
        <Item
          className={ItemStyle}
          label="Copy Title"
          icon={ClipboardCopyIcon}
          action={() =>
            copyValue(manga.title, `${manga.title} Copied Successfully`)
          }
        />
        <Item
          className={ItemStyle}
          label="Copy Link"
          icon={Link04Icon}
          action={() =>
            copyValue(manga.site, "Manga Linked Copied Successfully!")
          }
        />
        <Item
          className={ItemStyle}
          label="Mark as reading"
          icon={BookOpen02Icon}
          action={() => update("reading")}
        />
        <Item
          className={ItemStyle}
          label="Mark as planned"
          icon={LibraryIcon}
          action={() => update("planned")}
        />
        <Item
          className={ItemStyle}
          label="Mark as hiatus"
          icon={BookBookmark02Icon}
          action={() => update("hiatus")}
        />
        <Item
          className={ItemStyle}
          label="Mark as archived"
          icon={Archive02Icon}
          action={() => update("archived")}
        />
        <Item
          className={ItemStyle}
          label="Edit Manga"
          icon={Edit02Icon}
          action={(e) => {
            e.preventDefault();
            setTarget(manga.id);
            toggleSidebar();
          }}
        />
        <Item
          className="focus:bg-[--clr-danger-a0] focus:text-white"
          label="Delete"
          icon={Delete02Icon}
          action={() => deleteManga({ id: manga.id })}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
