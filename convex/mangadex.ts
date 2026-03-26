// convex/mangadex.ts
import { action } from "./_generated/server";
import { v } from "convex/values";

type MangaDexManga = {
    id: string;
    attributes: {
        title: Record<string, string>;
        altTitles: Record<string, string>[];
    };
    relationships: {
        id: string;
        type: string;
        attributes?: {
            fileName: string;
        };
    }[];
};

export const searchMangaByTitle = action({
    args: { title: v.string() },
    handler: async (_, { title }) => {
        const res = await fetch(
            `https://api.mangadex.org/manga?title=${encodeURIComponent(
                title
            )}&includes[]=cover_art`
        );

        const json = await res.json();

        return json.data.map((manga: MangaDexManga) => {
            const cover = manga.relationships.find(
                (rel) => rel.type === "cover_art"
            );

            const coverFileName = cover?.attributes?.fileName;

            return {
                id: manga.id,

                title:
                    manga.attributes.title.en ??
                    Object.values(manga.attributes.title)[0],

                alternative_titles: manga.attributes.altTitles.flatMap((alt) =>
                    Object.values(alt)
                ),

                cover_url: coverFileName
                    ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
                    : null,
            };
        });
    },
});
