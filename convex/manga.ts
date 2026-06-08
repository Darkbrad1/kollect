import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";


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
// ─── Returns UserManga based on a title────────────────────────────────────────
export const findUserMangaByTitle = query({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const searchTerm = args.title.toLowerCase();

    const userMangas = await ctx.db
      .query("userMangas")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const userManga of userMangas) {
      const manga = await ctx.db.get(userManga.mangaId);
      if (!manga) continue;

      const mangaTitles = await ctx.db
        .query("mangaTitles")
        .withIndex("by_mangaId", (q) => q.eq("mangaId", manga._id))
        .collect();

      const matchesDisplay = userManga.title
        .toLowerCase()
        .includes(searchTerm);

      const matchesAlt = mangaTitles.some((t) =>
        t.title.toLowerCase().includes(searchTerm),
      );

      if (!matchesDisplay && !matchesAlt) continue;

      const userSites = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId", (q) => q.eq("userMangaId", userManga._id))
        .collect();

      const currentUserSite = userSites.find((s) => s.current);
      if (!currentUserSite) continue;

      const currentSite = await ctx.db.get(currentUserSite.siteId);
      if (!currentSite) continue;

      return {
        id: userManga._id,
        MangaDexId: manga.mangadexId,
        coverImage: manga.coverImage,
        title: userManga.title,
        altTitles: mangaTitles.map((t) => t.title),
        currentChapter: userManga.currentChapter,

        lastReadAt: userManga.lastReadAt,
        status: userManga.status,
        scroll: userManga.scroll,
        DomainName: currentSite.domainName,
        url: currentUserSite.siteUrl,
        altUrl: userSites.map((s) => s.siteUrl),
        
      };
    }

    return null;
  },
});
// ─── Create Manga ─────────────────────────────────────────────────────────────
export const addManga = action({
  args: {
    title: v.string(),
    currentChapter: v.float64(),
    lastReadAt: v.number(),
    scroll: v.float64(),
    domainName: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const dexResults = await ctx.runAction(
      internal.mangadex.searchMangadexByTitle,
      { title: args.title },
    );

    return await ctx.runMutation(internal.manga.createManga, {
      mangadexId: dexResults?.id,
      coverImage: dexResults?.coverImage,
      title: args.title,
      currentChapter: args.currentChapter,
      lastReadAt: args.lastReadAt,
      scroll: args.scroll,
      domainName: args.domainName,
      status: "planned",
      url: args.url,
    });
  },
});
// ─── Insert Manga ─────────────────────────────────────────────────────────────
export const createManga = internalMutation({
  args: {
    mangadexId: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    title: v.string(),
    currentChapter: v.float64(),
    lastReadAt: v.number(),
    scroll: v.float64(),
    status: statusValidator,
    domainName: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    // 1. Find or insert manga
    let mangaId: Id<"mangas">;
    if (args.mangadexId) {
      const existing = await ctx.db
        .query("mangas")
        .withIndex("by_mangadexId", (q) =>
          q.eq("mangadexId", args.mangadexId!),
        )
        .first();
    
      mangaId = existing
        ? existing._id
        : await ctx.db.insert("mangas", {
            mangadexId: args.mangadexId,
            coverImage: args.coverImage || "",
          });
    } else {
      mangaId = await ctx.db.insert("mangas", {
        mangadexId: "",
        coverImage: args.coverImage || "",
      });
    }


    // 2. Insert into mangaTitles (only if it doesn't exist)
    const existingTitle = await ctx.db
      .query("mangaTitles")
      .withIndex("by_mangaId", (q) => q.eq("mangaId", mangaId))
      .filter((q) => q.eq(q.field("title"), args.title))
      .first();
    
    if (!existingTitle) {
      await ctx.db.insert("mangaTitles", {
        mangaId,
        title: args.title,
      });
    }

    // 3. Insert into userMangas
    const userMangaId = await ctx.db.insert("userMangas", {
      userId: user._id,
      mangaId,
      title: args.title,
      currentChapter: args.currentChapter,
      lastReadAt: args.lastReadAt,
      scroll: args.scroll,
      status: args.status,
    });

    // 4. Find or create site
    let site = await ctx.db
      .query("sites")
      .withIndex("by_domainName", (q) => q.eq("domainName", args.domainName))
      .unique();

    if (!site) {
      const siteId = await ctx.db.insert("sites", {
        domainName: args.domainName,
        logo: "",
      });
      site = await ctx.db.get(siteId);
    }

    // 5. Insert into userMangaSites
    await ctx.db.insert("userMangaSites", {
      userMangaId,
      siteId: site!._id,
      siteUrl: args.url,
      current: true,
    });

    return userMangaId;
  },
});
// ─── Update Manga ────────────────────────────────────────────────────────────
export const updateManga = mutation({
  args: {
    id: v.id("userMangas"),
    data: v.object({
      title: v.optional(v.string()),
      currentChapter: v.optional(v.float64()),
      lastReadAt: v.optional(v.number()),
      domainName: v.optional(v.string()),
      url: v.optional(v.string()),
      scroll: v.optional(v.float64()),
      status: v.optional(statusValidator),
    }),
  },

  handler: async (ctx, { id, data }) => {
    const user = await requireUser(ctx);
    const userManga = await ctx.db.get(id);
    if (!userManga || userManga.userId !== user._id) {
      throw new Error("Not found or unauthorized");
    }
    await ctx.db.patch(
      id,
      {
        title: data.title,
        currentChapter: data.currentChapter,
        lastReadAt: data.lastReadAt,
        scroll: data.scroll,
        status: "planned",
      }
    );
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

    // Delete associated userMangaSites
    const userSites = await ctx.db
      .query("userMangaSites")
      .withIndex("by_userMangaId", (q) => q.eq("userMangaId", id))
      .collect();

    await Promise.all(userSites.map((site) => ctx.db.delete(site._id)));

    await ctx.db.delete(id);
    return id;
  },
});
// ─── List Manga ───────────────────────────────────────────────────────────────
export const listManga = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const userMangas = await ctx.db
      .query("userMangas")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      userMangas.map(async (userManga) => {
        const [manga, userSites] = await Promise.all([
          ctx.db.get(userManga.mangaId),
          ctx.db
            .query("userMangaSites")
            .withIndex("by_userMangaId", (q) =>
              q.eq("userMangaId", userManga._id),
            )
            .collect(),
        ]);
        const [mangaTitles, currentSite] = await Promise.all([
          ctx.db
            .query("mangaTitles")
            .withIndex("by_mangaId", (q) => q.eq("mangaId", manga._id))
            .collect(),
          ctx.db.get(userSites.find((s) => s.current)?.siteId),
        ]);
        const currentUserSite = userSites.find((s) => s.current);

        return {
          id: userManga._id,
          MangaDexId: manga.mangadexId,
          coverImage: manga.coverImage,
          title: userManga.title,
          altTitles: mangaTitles.map((t) => t.title),
          currentChapter: userManga.currentChapter,
          lastReadAt: userManga.lastReadAt,
          status: userManga.status,
          scroll: userManga.scroll,
          DomainName: currentSite.domainName,
          url: currentUserSite.siteUrl,
          altUrl: userSites.map((site) => site.siteUrl),
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
      .withIndex("by_userMangaId", (q) => q.eq("userMangaId", userManga._id))
      .collect();
    const currentUserSite = userSites.find((site) => site.current);
    const userAltSites = userSites.map((site) => site.siteUrl);
    const site = await ctx.db.get("sites", currentUserSite.siteId);
    return {
      id: userManga._id,
      coverImage: manga.coverImage,
      MangaDexId: manga.mangadexId,

      title: userManga.title,
      altTitles: mangaTitles,
      currentChapter: userManga.currentChapter,
      lastReadAt: userManga.lastReadAt,
      scroll: userManga.scroll,
      status: userManga.status,
      domainName: site.domainName,
      url: currentUserSite.siteUrl,
      altUrl: userAltSites,
    };
  },
});
