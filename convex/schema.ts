import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  mangas: defineTable({
    coverImage: v.string(),
    mangadexId: v.string(),
    titles: v.array(v.string()),
  }).index("by_mangadexId", ["mangadexId"]),

  sites: defineTable({
    domainName: v.string(),
    logo: v.optional(v.string()),
  }).index("by_domainName", ["domainName"]),

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

    currentSiteId: v.optional(v.id("sites")),
  })
    .index("by_userId", ["userId"])
    .index("by_mangaId", ["mangaId"])
    .index("by_userId_and_mangaId", ["userId", "mangaId"])
    .index("by_userId_and_status", ["userId", "status"])
    .index("by_userId_and_lastReadAt", ["userId", "lastReadAt"]),

  userMangaSites: defineTable({
    userMangaId: v.id("userMangas"),
    siteId: v.id("sites"),
    siteUrl: v.string(),
  })
    .index("by_userMangaId", ["userMangaId"])
    .index("by_userMangaId_and_siteId", ["userMangaId", "siteId"])
    .index("by_siteId", ["siteId"]),
});