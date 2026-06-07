import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import Card from "./NewCard";


import NoMangas from "./NoMangas";
import { useAppState } from "./AppStateProvider";
import { Skeleton } from "./ui/skeleton";


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
        manga.title.toLowerCase().includes(search.toLowerCase()),
    );

    const filteredMangas = mangas.filter((manga) => manga.status === status);

    const inputMangas = !search ? filteredMangas : searchedMangas;

    return (
        <>
        <NoMangas mangas={inputMangas} />
            <div className="w-full flex flex-wrap gap-3 mx-auto custom-scroll py-1">
                {inputMangas.map((data) => (
                    <Card
                        key={data.id}
                        url={data.url}
                        id={data.id}
                        image={data.coverImage}
                        chapter={`${data.currentChapter}`}
                        title={data.title}
                        percentage={data.scroll}
                    />
                ))}
            </div>
        </>
    );
}
