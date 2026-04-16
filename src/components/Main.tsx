import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import Card from "./NewCard";

import CardView from "~/components/CardView";
import DetailedView from "~/components/DetailedView";
import NoMangas from "./NoMangas";
import { useAppState } from "./AppStateProvider";
import { Skeleton } from "./ui/skeleton";
import { LibraryBig } from "lucide-react"; // or any icon you prefer

export default function RenderMangas() {
    const { view, status, search } = useAppState();

    const mangas = useQuery(api.manga.listManga);

    if (mangas === undefined) {
        return (
            <div className="w-full flex flex-wrap gap-3 mx-auto">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[1/1.5] h-[218px]" />
                ))}
            </div>
        );
    }

    const searchedMangas = mangas.filter((manga) =>
        manga.display_title.toLowerCase().includes(search.toLowerCase()),
    );

    const filteredMangas = mangas.filter((manga) => manga.status === status);

    const inputMangas = !search ? filteredMangas : searchedMangas;

    // if (inputMangas.length === 0) {
    //     return (
    //         <div className="w-full h-full flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
    //             <LibraryBig className="h-12 w-12" />
    //             <p className="text-sm font-medium">No manga found</p>
    //             <p className="text-xs">
    //                 {search
    //                     ? `No results for "${search}"`
    //                     : "Nothing here yet. Add some manga to get started."}
    //             </p>
    //         </div>
    //     );
    // }
    return (
        <>
        <NoMangas mangas={inputMangas} />
            <div className="w-full flex flex-wrap gap-3 mx-auto overflow-hidden">
                {inputMangas.map((data) => (
                    <Card
                        key={data._id}
                        url={data.site_url}
                        id={data._id}
                        image={data.cover_url}
                        chapter={`${data.chapter_number}`}
                        title={data.display_title}
                    />
                ))}
            </div>
        </>
    );
}
