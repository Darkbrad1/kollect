import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const getTitleByMangaId = query({
    args: { mangaId: v.id("mangas") },
    handler: async (ctx, { mangaId }) => {
        await requireUser(ctx);
        return await ctx.db
            .query("mangaTitles")
            .withIndex("by_mangaId", (q) => q.eq("mangaId", mangaId))
            .collect();
    },
});

// ─── Manga Titles CRUD ────────────────────────────────────────────────────────

export const addMangaTitle = mutation({
    args: {
        mangaId: v.id("mangas"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await requireUser(ctx);
        return await ctx.db.insert("mangaTitles", args);
    },
});

export const updateMangaTitle = mutation({
    args: {
        id: v.id("mangaTitles"),
        title: v.string(),
    },
    handler: async (ctx, { id, title }) => {
        await requireUser(ctx);
        const mangaTitle = await ctx.db.get(id);
        if (!mangaTitle) throw new Error("Title not found");
        await ctx.db.patch(id, { title });
        return id;
    },
});

export const deleteMangaTitle = mutation({
    args: { id: v.id("mangaTitles") },
    handler: async (ctx, { id }) => {
        await requireUser(ctx);
        const mangaTitle = await ctx.db.get(id);
        if (!mangaTitle) throw new Error("Title not found");
        await ctx.db.delete(id);
        return id;
    },
});
