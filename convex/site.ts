import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";

export const getSitesByUserMangaId = query({
    args: { userMangaId: v.id("userMangas") },
    handler: async (ctx, { userMangaId }) => {
        await requireUser(ctx);
        return await ctx.db
            .query("userMangaSites")
            .withIndex("by_userMangaId", (q) =>
                q.eq("userMangaId", userMangaId),
            )
            .collect();
    },
});

export const getCurrentSiteByUserMangaId = query({
    args: { userMangaId: v.id("userMangas") },
    handler: async (ctx, { userMangaId }) => {
        await requireUser(ctx);

        const sites = await ctx.db
            .query("userMangaSites")
            .withIndex("by_userMangaId", (q) =>
                q.eq("userMangaId", userMangaId),
            )
            .collect();

        return sites.find((s) => s.current === true); // one row or undefined
    },
});

export const getSiteByDomain = query({
    args: { siteDomainName: v.string() },
    handler: async (ctx, { siteDomainName }) => {
        await requireUser(ctx);
        return await ctx.db
            .query("sites")
            .withIndex("by_siteDomainName", (q) =>
                q.eq("siteDomainName", siteDomainName),
            )
            .first();
    },
});

export const createSite = mutation({
    args: {
        siteDomainName: v.string(),
        siteLogo: v.string(),
    },
    handler: async (ctx, args) => {
        await requireUser(ctx);
        return await ctx.db.insert("sites", args);
    },
});

export const addUserMangaSite = mutation({
    args: {
        userMangaId: v.id("userMangas"),
        siteId: v.id("sites"),
        siteChapterUrl: v.string(),
        current: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await requireUser(ctx);

        const userManga = await ctx.db.get(args.userMangaId);
        if (!userManga || userManga.userId !== user._id) {
            throw new Error("Not found or unauthorized");
        }

        // If setting as current, unset any existing current site
        if (args.current) {
            const existingSites = await ctx.db
                .query("userMangaSites")
                .withIndex("by_userMangaId", (q) =>
                    q.eq("userMangaId", args.userMangaId),
                )
                .filter((q) => q.eq(q.field("current"), true))
                .collect();

            await Promise.all(
                existingSites.map((site) =>
                    ctx.db.patch(site._id, { current: false }),
                ),
            );
        }

        return await ctx.db.insert("userMangaSites", args);
    },
});

export const updateUserMangaSite = mutation({
    args: {
        id: v.id("userMangaSites"),
        data: v.object({
            siteChapterUrl: v.optional(v.string()),
            current: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, { id, data }) => {
        const user = await requireUser(ctx);

        const site = await ctx.db.get(id);
        if (!site) throw new Error("Site not found");

        const userManga = await ctx.db.get(site.userMangaId);
        if (!userManga || userManga.userId !== user._id) {
            throw new Error("Not found or unauthorized");
        }

        // If setting as current, unset any existing current site
        if (data.current) {
            const existingSites = await ctx.db
                .query("userMangaSites")
                .withIndex("by_userMangaId", (q) =>
                    q.eq("userMangaId", site.userMangaId),
                )
                .filter((q) => q.eq(q.field("current"), true))
                .collect();

            await Promise.all(
                existingSites.map((s) =>
                    ctx.db.patch(s._id, { current: false }),
                ),
            );
        }

        await ctx.db.patch(id, data);
        return id;
    },
});

export const deleteUserMangaSite = mutation({
    args: { id: v.id("userMangaSites") },
    handler: async (ctx, { id }) => {
        const user = await requireUser(ctx);

        const site = await ctx.db.get(id);
        if (!site) throw new Error("Site not found");

        const userManga = await ctx.db.get(site.userMangaId);
        if (!userManga || userManga.userId !== user._id) {
            throw new Error("Not found or unauthorized");
        }

        await ctx.db.delete(id);
        return id;
    },
});

// findOrCreateSite
export const findOrCreateSite = mutation({
    args: { siteDomainName: v.string() },
    handler: async (ctx, { siteDomainName }) => {
        const existing = await ctx.db
            .query("sites")
            .withIndex("by_siteDomainName", (q) =>
                q.eq("siteDomainName", siteDomainName),
            )
            .unique();

        if (existing) return existing._id;

        return await ctx.db.insert("sites", {
            siteDomainName,
            siteLogo: "", // placeholder, update later if needed
        });
    },
});

// upsertUserMangaSite
export const upsertUserMangaSite = mutation({
    args: {
        userMangaId: v.id("userMangas"),
        siteId: v.id("sites"),
        siteChapterUrl: v.string(),
    },
    handler: async (ctx, { userMangaId, siteId, siteChapterUrl }) => {
        // Set all existing sites for this manga to current: false
        const allSites = await ctx.db
            .query("userMangaSites")
            .withIndex("by_userMangaId", (q) =>
                q.eq("userMangaId", userMangaId),
            )
            .collect();

        await Promise.all(
            allSites.map((site) => ctx.db.patch(site._id, { current: false })),
        );

        // Find if this specific site already exists
        const existingSite = allSites.find((site) => site.siteId === siteId);

        if (existingSite) {
            await ctx.db.patch(existingSite._id, {
                siteChapterUrl,
                current: true,
            });
        } else {
            await ctx.db.insert("userMangaSites", {
                userMangaId,
                siteId,
                siteChapterUrl,
                current: true,
            });
        }
    },
});
