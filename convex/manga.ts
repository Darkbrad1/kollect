import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

const statusValidator = v.union(
    v.literal("reading"),
    v.literal("planned"),
    v.literal("hiatus"),
    v.literal("archived"),
);

// ─── Manga Exist (in mangas table by mangadexId) ─────────────────────────────

export const mangaExist = query({
    args: { mangadexId: v.string() },
    handler: async (ctx, { mangadexId }) => {
        await requireUser(ctx);
        return await ctx.db
            .query("mangas")
            .filter((q: any) => q.eq(q.field("mangadexId"), mangadexId))
            .first();
    },
});

// ─── UserManga Exist (does this user already have this manga) ─────────────────

export const userMangaExist = query({
    args: { mangaId: v.id("mangas") },
    handler: async (ctx, { mangaId }) => {
        const user = await requireUser(ctx);
        return await ctx.db
            .query("userMangas")
            .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
            .filter((q: any) => q.eq(q.field("mangaId"), mangaId))
            .first();
    },
});

// ─── Create Manga ─────────────────────────────────────────────────────────────

export const createManga = mutation({
    args: {
        mangadexId: v.string(),
        coverUrl: v.string(),
        // title: v.string(),
        latestChapter: v.float64(),
        displayTitle: v.string(),
        chapterNumber: v.float64(),
        lastReadAt: v.number(),
        scrollPercentage: v.float64(),
        status: statusValidator,
    },

    handler: async (ctx, args) => {
        const user = await requireUser(ctx);
        const mangaId = await ctx.db.insert("mangas", {
            mangadexId: args.mangadexId,
            coverUrl: args.coverUrl,
            latestChapter: args.latestChapter,
        });
        // await ctx.db.insert("mangaTitles", {
        // mangaId,
        // title: args.title,
        // })
        return await ctx.db.insert("userMangas", {
            userId: user._id,
            mangaId,
            displayTitle: args.displayTitle,
            chapterNumber: args.chapterNumber,
            lastReadAt: args.lastReadAt,
            scrollPercentage: args.scrollPercentage,
            status: args.status,
        });
    },
});

// ─── Update Manga ────────────────────────────────────────────────────────────

export const updateManga = mutation({
    args: {
        id: v.id("userMangas"),
        data: v.object({
            displayTitle: v.optional(v.string()),
            chapterNumber: v.optional(v.float64()),
            lastReadAt: v.optional(v.number()),
            scrollPercentage: v.optional(v.float64()),
            status: v.optional(statusValidator),
        }),
    },

    handler: async (ctx, { id, data }) => {
        const user = await requireUser(ctx);
        const userManga = await ctx.db.get(id);
        if (!userManga || userManga.userId !== user._id) {
            throw new Error("Not found or unauthorized");
        }
        await ctx.db.patch(id, data);
        return id;
    },
});

// ─── Delete Manga ─────────────────────────────────────────────────────────────

export const deleteManga = mutation({
    args: { id: v.id("userMangas") },
    handler: async (ctx, { id }) => {
        const user = await requireUser(ctx);
        const userManga = await ctx.db.get(id);
        if (!userManga || userManga.userId !== user._id) {
            throw new Error("Not found or unauthorized");
        }
        await ctx.db.delete(id);
        return id;
    },
});

// ─── List Manga ───────────────────────────────────────────────────────────────
export const listManga = query({
    args: {},
    handler: async (ctx) => {
        const user = await requireUser(ctx);
        console.log("User ID:", user._id);
        const userMangas = await ctx.db
            .query("userMangas")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
        return await Promise.all(
            userMangas.map(async (userManga) => {
                const manga = await ctx.db.get(userManga.mangaId);
                const mangaTitles = (
                    await ctx.db
                        .query("mangaTitles")
                        .withIndex("by_mangaId", (q) =>
                            q.eq("mangaId", manga._id),
                        )
                        .collect()
                ).map((title) => title.title);
                const userSites = await ctx.db
                    .query("userMangaSites")
                    .withIndex("by_userMangaId", (q) =>
                        q.eq("userMangaId", userManga._id),
                    )
                    .collect();
                const currentUserSite = userSites.find((site) => site.current);
                const userAltSites = userSites.map(
                    (site) => site.siteChapterUrl,
                );
                const site = await ctx.db.get(currentUserSite.siteId);
                return {
                    id: userManga._id,
                    MangaDexId: manga.mangadexId,
                    coverImage: manga.coverUrl,
                    title: userManga.displayTitle,
                    altTitles: mangaTitles,
                    currentChapter: userManga.chapterNumber,
                    latestChapter: manga.latestChapter,
                    lastReadAt: userManga.lastReadAt,
                    status: userManga.status,
                    scroll: userManga.scrollPercentage,
                    DomainName: site.siteDomainName,
                    url: currentUserSite.siteChapterUrl,
                    altUrl: userAltSites,
                };
            }),
        );
    },
});

// ─── Get Manga ────────────────────────────────────────────────────────────────

export const getManga = query({
    args: {
        id: v.id("userMangas"),
    },
    handler: async (ctx, { id }) => {
        const user = await requireUser(ctx);
        const userManga = await ctx.db.get(id);
        if (!userManga || userManga.userId !== user._id) {
            throw new Error("Not found or unauthorized");
        }
        const manga = await ctx.db.get("mangas", userManga.mangaId);
        const mangaTitles = (
            await ctx.db
                .query("mangaTitles")
                .withIndex("by_mangaId", (q) => q.eq("mangaId", manga._id))
                .collect()
        ).map((title) => title.title);
        const userSites = await ctx.db
            .query("userMangaSites")
            .withIndex("by_userMangaId", (q) =>
                q.eq("userMangaId", userManga._id),
            )
            .collect();
        const currentUserSite = userSites.find((site) => site.current);
        const userAltSites = userSites.map((site) => site.siteChapterUrl);
        const site = await ctx.db.get("sites", currentUserSite.siteId);
        return {
            id: userManga._id,
            MangaDexId: manga.mangadexId,
            coverImage: manga.coverUrl,
            title: userManga.displayTitle,
            altTitles: mangaTitles,
            currentChapter: userManga.chapterNumber,
            latestChapter: manga.latestChapter,
            lastReadAt: userManga.lastReadAt,
            status: userManga.status,
            scroll: userManga.scrollPercentage,
            DomainName: site.siteDomainName,
            url: currentUserSite.siteChapterUrl,
            altUrl: userAltSites,
        };
    },
});
