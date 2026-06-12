import { LibraryBig } from "lucide-react";
import { useAppState } from "./AppStateProvider";
// import type { Doc } from "convex/_generated/dataModel";
import type { UserMangaPayload } from "~/lib/manga/types";

interface NoMangaProps {
    mangas: UserMangaPayload[]
}// or any icon you prefer
export default function NoMangas({mangas}:NoMangaProps){
    const { search } = useAppState();


    if (mangas.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <LibraryBig className="h-12 w-12" />
                <p className="text-sm font-medium">No manga found</p>
                <p className="text-xs">
                    {search
                        ? `No results for "${search}"`
                        : "Nothing here yet. Add some manga to get started."}
                </p>
            </div>
        );
    }
}