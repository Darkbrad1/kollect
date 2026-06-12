import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./auth";
import { internalMutation, action } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { tabs } from "~/settings/appSetting";

const statusValidator = v.union(
  v.literal(tabs[0]),
  v.literal(tabs[1]),
  v.literal(tabs[2]),
  v.literal(tabs[3]),
);

// ─── UserManga Exist (does this user already have this manga) ─────────────────
export const userMangaExist = query({
  args: { mangaId: v.id("mangas") },
  handler: async (ctx, { mangaId }) => {
    console.log("user Manga Exist");
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
    console.log("find user Manga by title");
    const user = await requireUser(ctx);
    const searchedTitle = args.title.toLowerCase();

    const userMangas = await ctx.db
      .query("userMangas")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const userManga of userMangas) {
      const manga = await ctx.db.get(userManga.mangaId);
      if (!manga) continue; // skip below if no manga is found

      const matchesDisplay = userManga.title
        .toLowerCase()
        .includes(searchedTitle);

      const matchesAlt = manga.titles.some((title) =>
        title.toLowerCase().includes(searchedTitle),
      );

      if (!matchesDisplay && !matchesAlt) continue; // skip below if no title is found

      const userSites = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId", (q) => q.eq("userMangaId", userManga._id))
        .collect();

      const currentUserSite = userSites.find(
        (site) => site.siteUrl === userManga.site,
      );
      if (!currentUserSite) continue;

      const currentSite = await ctx.db.get(currentUserSite.siteId);
      if (!currentSite) continue;

      return {
        id: userManga._id,
        MangaDexId: manga.mangadexId,
        coverImage: manga.coverImage,
        title: userManga.title,
        altTitles: manga.titles,
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
// ─── add Manga ─────────────────────────────────────────────────────────────
export const addManga = action({
  args: {
    title: v.string(),
    currentChapter: v.float64(),
    lastReadAt: v.number(),
    scroll: v.float64(),
    domainName: v.optional(v.string()),
    status: v.optional(statusValidator),
    site: v.string(),
    siteLogo: v.string()
  },
  handler: async (ctx, args) => {
    console.log("Add Manga");
    const dexResults = await ctx.runAction(
      internal.mangadex.searchMangadexByTitle,
      { title: args.title },
    );

    return await ctx.runMutation(internal.manga.createManga, {
      mangadexId: dexResults?.id,
      coverImage: dexResults?.coverImage,
      title: args.title,
      altTitles: dexResults?.alternativeTitles,
      currentChapter: args.currentChapter,
      lastReadAt: args.lastReadAt,
      scroll: args.scroll,
      domainName: args.domainName,
      status: args.status,
      site: args.site,
      siteLogo: args.siteLogo,
    });
  },
});
// ─── create Manga ─────────────────────────────────────────────────────────────
export const createManga = internalMutation({
  args: {
    mangadexId: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    title: v.string(),
    altTitles: v.optional(v.array(v.string())),
    currentChapter: v.float64(),
    lastReadAt: v.number(),
    scroll: v.float64(),
    status: statusValidator,
    domainName: v.string(),
    site: v.string(),
    siteLogo: v.string()
  },
  handler: async (ctx, args) => {
    console.log("create Manga");
    const user = await requireUser(ctx);
    async function findOrCreateManga() {
      let manga;
    
      // 1. Try by mangadexId first
      if (args.mangadexId) {
        manga = await ctx.db
          .query("mangas")
          .withIndex("by_mangadexId", (q: any) =>
            q.eq("mangadexId", args.mangadexId),
          )
          .first();
      }
    
      // 2. Fallback to title match
      if (!manga) {
        const allMangas = await ctx.db.query("mangas").collect();
        manga = allMangas.find((manga: any) =>
          manga.titles.some(
            (title: string) => title.toLowerCase() === args.title.toLowerCase(),
          ),
        );
      }
    
      // 3. Create if not found
      if (!manga) {
        let altTitles: string[]
        if (!args.altTitles) {
          altTitles = [args.title]
        } else { 
          altTitles = [...new Set([args.title,...args.altTitles])]
        }
        const mangaId = await ctx.db.insert("mangas", {
          mangadexId: args.mangadexId ?? "",
          coverImage: args.coverImage ?? "",
          titles: altTitles
        });
        return await ctx.db.get(mangaId);
      }
    
      // 4. Add title if unique
      const titleExists = manga.titles.some(
        (title: string) => title.toLowerCase() === args.title.toLowerCase(),
      );
    
      if (!titleExists) {
        await ctx.db.patch(manga._id, {
          titles: [...new Set([...manga.titles, args.title, ...args.altTitles])]
        });
      }
    
      return manga;
    }
    async function findOrCreateUserSite(userMangaId: Id<"userMangas">) {
      const userSites = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId", (q) => q.eq("userMangaId", userMangaId))
        .collect();

      const siteExists = userSites.some((site) => site.siteUrl === args.site);

      if (!siteExists) {
        const siteId = await ctx.runMutation(
          internal.site.findOrCreateSiteInternal,
          { domainName: args.domainName, logo: args.siteLogo},
        );

        await ctx.db.insert("userMangaSites", {
          userMangaId,
          siteId,
          siteUrl: args.site,
        });
      }
    }
    
    const manga = await findOrCreateManga();
    
    // step 2 = add the user manga data to it table 
    const userMangaId = await ctx.db.insert("userMangas", {
      userId: user._id,
      mangaId: manga._id,
      title: args.title,
      currentChapter: args.currentChapter,
      lastReadAt: args.lastReadAt,
      scroll: args.scroll,
      status: args.status,
      site: args.site,
    });
    // step 3 = check if the user already has this site, if not add it
    findOrCreateUserSite(userMangaId)

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
    if (data.site !== undefined) {
      const userSites = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId", (q) => q.eq("userMangaId", userManga._id))
        .collect();

      const currentUserSite = userSites.find(
        (site) => site.siteUrl === userManga.site,
      );

      if (currentUserSite) {
        await ctx.db.patch(currentUserSite._id, { siteUrl: data.site });
      }
    }

    return id;
  },
});
// ─── Delete Manga ─────────────────────────────────────────────────────────────
export const deleteManga = mutation({
  args: { id: v.id("userMangas") },
  handler: async (ctx, { id }) => {
    console.log("delete Manga");
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
    console.log("list Manga");
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
        const currentSite = await ctx.db.get(
          userSites.find((site) => site.siteUrl === userManga.site).siteId,
        );
        const currentUserSite = userSites.find(
          (site) => site.siteUrl === userManga.site,
        );

        return {
          id: userManga._id,
          MangaDexId: manga.mangadexId,
          coverImage: manga.coverImage,
          title: userManga.title,
          altTitles: manga.titles,
          currentChapter: userManga.currentChapter,
          lastReadAt: userManga.lastReadAt,
          status: userManga.status,
          scroll: userManga.scroll,
          DomainName: currentSite.domainName,
          site: currentUserSite.siteUrl,
          siteLogo: currentSite.logo,
          altSite: userSites.map((site) => site.siteUrl),
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
    console.log("get Manga");
    const user = await requireUser(ctx);
    const userManga = await ctx.db.get(id);
    if (!userManga || userManga.userId !== user._id) {
      return console.log("Not found or unauthorized");
      // throw new Error("Not found or unauthorized");
    }
    const manga = await ctx.db.get("mangas", userManga.mangaId);

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
      altTitles: manga.titles,
      currentChapter: userManga.currentChapter,
      lastReadAt: userManga.lastReadAt,
      scroll: userManga.scroll,
      status: userManga.status,
      domainName: site.domainName,
      site: currentUserSite.siteUrl,
      siteLogo: site.logo,
      altSite: userAltSites,
    };
  },
});
