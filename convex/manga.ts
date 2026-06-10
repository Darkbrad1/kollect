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
    console.log("manga exist")
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
    console.log("user Manga Exist")
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
    console.log("find user Manga by title")
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

      const currentUserSite = userSites.find((site) => site.siteUrl=== userManga.site );
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
        site: currentUserSite.siteUrl,
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
    site: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Add Manga")
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
      site: args.site,
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
    site: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("create Manga")
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
    await ctx.runMutation(internal.Title.upsertMangaTitleInternal, {
        mangaId,
        title: args.title,
    });

    // 3. Insert into userMangas
    const userMangaId = await ctx.db.insert("userMangas", {
      userId: user._id,
      mangaId,
      title: args.title,
      currentChapter: args.currentChapter,
      lastReadAt: args.lastReadAt,
      scroll: args.scroll,
      status: args.status,
      site: args.site,
    });

    // 4 & 5. Find/create site and link to userManga
    const siteId = await ctx.runMutation(
        internal.site.findOrCreateSiteInternal,
        { domainName: args.domainName },
    );
    
    await ctx.runMutation(internal.site.upsertUserMangaSiteInternal, {
        userMangaId,
        siteId,
        siteUrl: args.site,
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
      site: v.optional(v.string()),
      scroll: v.optional(v.float64()),
      status: v.optional(statusValidator),
    }),
  },

  handler: async (ctx, { id, data }) => {
    console.log("update Manga");
    const user = await requireUser(ctx);
    const userManga = await ctx.db.get(id);
    if (!userManga || userManga.userId !== user._id) {
      throw new Error("Not found or unauthorized");
    }

    const patchData = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.currentChapter !== undefined && {
        currentChapter: data.currentChapter,
      }),
      ...(data.lastReadAt !== undefined && { lastReadAt: data.lastReadAt }),
      ...(data.scroll !== undefined && { scroll: data.scroll }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.site !== undefined && { site: data.site }),

    };
    await ctx.db.patch(id, patchData);

    // Update the current user site if siteUrl is provided
    // if (data.site !== undefined) {
    //   const userSites = await ctx.db
    //     .query("userMangaSites")
    //     .withIndex("by_userMangaId", (q) => q.eq("userMangaId", userManga._id))
    //     .collect();

    //   const currentUserSite = userSites.find((site) => site.siteUrl === userManga.site);

    //   if (currentUserSite) {
    //     await ctx.db.patch(currentUserSite._id, { siteUrl: data.site });
    //   }
    // }

    return id;
  },
});
// ─── Delete Manga ─────────────────────────────────────────────────────────────
export const deleteManga = mutation({
  args: { id: v.id("userMangas") },
  handler: async (ctx, { id }) => {
    console.log("delete Manga")
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
    console.log("list Manga")
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
          ctx.db.get(userSites.find((site) => site.siteUrl=== userManga.site )?.siteId),
        ]);
        const currentUserSite = userSites.find((site) => site.siteUrl=== userManga.site );

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
          site: currentUserSite.siteUrl,
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
    console.log("get Manga")
    const user = await requireUser(ctx);
    const userManga = await ctx.db.get(id);
    if (!userManga || userManga.userId !== user._id) {
      return console.log("Not found or unauthorized")
      // throw new Error("Not found or unauthorized");
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
    const currentUserSite = userSites.find((site) => site.siteUrl);
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
      site: currentUserSite.siteUrl,
      altUrl: userAltSites,
    };
  },
});
