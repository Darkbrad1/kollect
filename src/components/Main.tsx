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
    // const mangas = undefined
    if (mangas === undefined) {
        return (
            <div className="w-full flex flex-wrap gap-3 mx-auto custom-scroll">
                {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[1/1.5] h-[211px]" />
                ))}
            </div>
        );
    }

    const searchedMangas = mangas.filter((manga) =>
        manga.display_title.toLowerCase().includes(search.toLowerCase()),
    );

    const filteredMangas = mangas.filter((manga) => manga.status === status);

    const inputMangas = !search ? filteredMangas : searchedMangas;

    return (
        <>
        <NoMangas mangas={inputMangas} />
            <div className="w-full flex flex-wrap gap-3 mx-auto custom-scroll">
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
