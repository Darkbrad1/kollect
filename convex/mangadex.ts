// convex/mangadex.ts
import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";

type MangaDexManga = {
    id: string;
    attributes: {
        title: Record<string, string>;
        altTitles: Record<string, string>[];
        latestUploadedChapter: string | null;
    };
    relationships: {
        id: string;
        type: string;
        attributes?: {
            fileName: string;
        };
    }[];
};

type MangaDexChapter = {
    attributes: {
        chapter: string | null;
        title: string | null;
        translatedLanguage: string;
        publishAt: string;
        externalUrl: string | null;
    };
};

export const searchMangadexByTitle = internalAction({
    args: { title: v.string() },
    handler: async (_, { title }) => {
        const res = await fetch(
            `https://api.mangadex.org/manga?title=${encodeURIComponent(
                title
            )}&includes[]=cover_art&limit=1`
        );

        const json = await res.json();
        const manga: MangaDexManga = json.data[0];

        if (!manga) return null;

        const cover = manga.relationships.find(
            (rel) => rel.type === "cover_art"
        );
        const coverFileName = cover?.attributes?.fileName;

        let latestChapter = null;
        if (manga.attributes.latestUploadedChapter) {
            const chapterRes = await fetch(
                `https://api.mangadex.org/chapter/${manga.attributes.latestUploadedChapter}`
            );
            const chapterJson = await chapterRes.json();
            const ch: MangaDexChapter = chapterJson.data;

            latestChapter = {
                id: manga.attributes.latestUploadedChapter,
                chapter: ch.attributes.chapter,
                title: ch.attributes.title,
                language: ch.attributes.translatedLanguage,
                publishedAt: ch.attributes.publishAt,
                externalUrl: ch.attributes.externalUrl,
            };
        }

        return {
            id: manga.id,
            title:
                manga.attributes.title.en ??
                Object.values(manga.attributes.title)[0],
            alternativeTitles: manga.attributes.altTitles.flatMap((alt) =>
                Object.values(alt)
            ),
            coverImage: coverFileName
                ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
                : null,
            latestChapter: latestChapter,
        };
    },
});