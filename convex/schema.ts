import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
    }).index("by_clerkId", ["clerkId"]),

    userMangas: defineTable({
        userId: v.id("users"),
        mangaId: v.id("mangas"),
        title: v.string(),
        currentChapter: v.float64(),
        lastReadAt: v.number(),
        scroll: v.float64(),
        status: v.union(
            v.literal("reading"),
            v.literal("planned"),
            v.literal("hiatus"),
            v.literal("archived"),
        ),
    }).index("by_userId", ["userId"]),

    userMangaSites: defineTable({
        userMangaId: v.id("userMangas"),
        siteId: v.id("sites"),
        siteUrl: v.string(),
        current: v.boolean()
    }).index("by_userMangaId", ["userMangaId"]),

    sites: defineTable({
        domainName: v.string(),
        logo: v.string(),
    }).index("by_domainName", ["domainName"]),

    mangas: defineTable({
        coverUrl: v.string(),
        mangadexId: v.string(),
    }),

    mangaTitles: defineTable({
        mangaId: v.id("mangas"),
        title: v.string(),
    }).index("by_mangaId", ["mangaId"]),
});
