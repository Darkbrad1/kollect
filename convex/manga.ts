import {
  action,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { requireUser } from "./auth";
import { tabs } from "~/settings/appSetting";

const statusValidator = v.union(
  v.literal(tabs[0]),
  v.literal(tabs[1]),
  v.literal(tabs[2]),
  v.literal(tabs[3]),
);

type MangaResult = {
  id: Id<"userMangas">;
  MangaDexId: string;
  coverImage: string;
  title: string;
  altTitles: string[];
  currentChapter: number;
  lastReadAt: number;
  status: (typeof tabs)[number];
  scroll: number;
  domainName: string | null;
  site: string | null;
  siteLogo: string | null;
  altSite: string[];
};

// ─── User Manga Exists ───────────────────────────────────────────────────────

export const userMangaExist = query({
  args: {
    mangaId: v.id("mangas"),
  },
  handler: async (ctx, { mangaId }) => {
    const user = await requireUser(ctx);

    return ctx.db
      .query("userMangas")
      .withIndex("by_userId_and_mangaId", (q) =>
        q.eq("userId", user._id).eq("mangaId", mangaId),
      )
      .unique();
  },
});

// ─── Find User Manga by Title ────────────────────────────────────────────────

export const findUserMangaByTitle = query({
  args: {
    title: v.string(),
  },
  handler: async (ctx, { title }): Promise<MangaResult | null> => {
    const user = await requireUser(ctx);
    const searchedTitle = title.trim().toLowerCase();

    const userMangas = await ctx.db
      .query("userMangas")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const userManga of userMangas) {
      const manga = await ctx.db.get(userManga.mangaId);

      if (!manga) {
        continue;
      }

      const matchesDisplayTitle = userManga.title
        .toLowerCase()
        .includes(searchedTitle);

      const matchesAlternativeTitle = manga.titles.some((mangaTitle) =>
        mangaTitle.toLowerCase().includes(searchedTitle),
      );

      if (!matchesDisplayTitle && !matchesAlternativeTitle) {
        continue;
      }

      const userSites = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId", (q) =>
          q.eq("userMangaId", userManga._id),
        )
        .collect();

      const currentUserSite = userManga.currentSiteId
        ? userSites.find(
            (userSite) => userSite.siteId === userManga.currentSiteId,
          )
        : undefined;

      const currentSite = currentUserSite
        ? await ctx.db.get(currentUserSite.siteId)
        : null;

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
        domainName: currentSite?.domainName ?? null,
        site: currentUserSite?.siteUrl ?? null,
        siteLogo: currentSite?.logo ?? null,
        altSite: userSites.map((userSite) => userSite.siteUrl),
      };
    }

    return null;
  },
});

// ─── Add Manga ───────────────────────────────────────────────────────────────

export const addManga = action({
  args: {
    title: v.string(),
    currentChapter: v.float64(),
    lastReadAt: v.number(),
    scroll: v.float64(),
    domainName: v.string(),
    status: statusValidator,
    site: v.string(),
    siteLogo: v.string(),
  },
  handler: async (ctx, args) => {
    const dexResults = await ctx.runAction(
      internal.mangadex.searchMangadexByTitle,
      {
        title: args.title,
      },
    );

    return ctx.runMutation(internal.manga.createManga, {
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

// ─── Create Manga ────────────────────────────────────────────────────────────

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
    siteLogo: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    let manga = null;

    if (args.mangadexId) {
      manga = await ctx.db
        .query("mangas")
        .withIndex("by_mangadexId", (q) =>
          q.eq("mangadexId", args.mangadexId),
        )
        .unique();
    }

    if (!manga) {
      const normalizedTitle = args.title.trim().toLowerCase();
      const allMangas = await ctx.db.query("mangas").collect();

      manga =
        allMangas.find((existingManga) =>
          existingManga.titles.some(
            (existingTitle) =>
              existingTitle.trim().toLowerCase() === normalizedTitle,
          ),
        ) ?? null;
    }

    const titles = [args.title, ...(args.altTitles ?? [])].filter(
      (title, index, allTitles) => {
        const normalizedTitle = title.trim().toLowerCase();

        return (
          title.trim().length > 0 &&
          allTitles.findIndex(
            (candidate) =>
              candidate.trim().toLowerCase() === normalizedTitle,
          ) === index
        );
      },
    );

    if (!manga) {
      const mangaId = await ctx.db.insert("mangas", {
        mangadexId: args.mangadexId ?? "",
        coverImage: args.coverImage ?? "",
        titles,
      });

      manga = await ctx.db.get(mangaId);

      if (!manga) {
        throw new Error("Failed to create manga.");
      }
    } else {
      const mergedTitles = [...manga.titles];

      for (const title of titles) {
        const titleAlreadyExists = mergedTitles.some(
          (existingTitle) =>
            existingTitle.trim().toLowerCase() ===
            title.trim().toLowerCase(),
        );

        if (!titleAlreadyExists) {
          mergedTitles.push(title);
        }
      }

      if (mergedTitles.length !== manga.titles.length) {
        await ctx.db.patch(manga._id, {
          titles: mergedTitles,
        });
      }
    }

    const existingUserManga = await ctx.db
      .query("userMangas")
      .withIndex("by_userId_and_mangaId", (q) =>
        q.eq("userId", user._id).eq("mangaId", manga._id),
      )
      .unique();

    const siteId = await ctx.runMutation(
      internal.site.findOrCreateSiteInternal,
      {
        domainName: args.domainName,
        logo: args.siteLogo,
      },
    );

    if (existingUserManga) {
      const existingUserMangaSite = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId_and_siteId", (q) =>
          q.eq("userMangaId", existingUserManga._id).eq("siteId", siteId),
        )
        .unique();

      if (!existingUserMangaSite) {
        await ctx.db.insert("userMangaSites", {
          userMangaId: existingUserManga._id,
          siteId,
          siteUrl: args.site,
        });
      } else if (existingUserMangaSite.siteUrl !== args.site) {
        await ctx.db.patch(existingUserMangaSite._id, {
          siteUrl: args.site,
        });
      }

      await ctx.db.patch(existingUserManga._id, {
        title: args.title,
        currentChapter: args.currentChapter,
        lastReadAt: args.lastReadAt,
        scroll: args.scroll,
        status: args.status,
        currentSiteId: siteId,
      });

      return existingUserManga._id;
    }

    const userMangaId = await ctx.db.insert("userMangas", {
      userId: user._id,
      mangaId: manga._id,
      title: args.title,
      currentChapter: args.currentChapter,
      lastReadAt: args.lastReadAt,
      scroll: args.scroll,
      status: args.status,
      currentSiteId: siteId,
    });

    await ctx.db.insert("userMangaSites", {
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
      scroll: v.optional(v.float64()),
      status: v.optional(statusValidator),
      siteUrl: v.optional(v.string()),
      currentSiteId: v.optional(v.id("sites")),
    }),
  },
  handler: async (ctx, { id, data }) => {
    const user = await requireUser(ctx);

    const userManga = await ctx.db.get(id);

    if (!userManga || userManga.userId !== user._id) {
      throw new Error("Not found or unauthorized.");
    }

    if (data.currentSiteId !== undefined) {
      const selectedUserMangaSite = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId_and_siteId", (q) =>
          q.eq("userMangaId", id).eq("siteId", data.currentSiteId),
        )
        .unique();

      if (!selectedUserMangaSite) {
        throw new Error("That site is not configured for this manga.");
      }
    }

    if (data.siteUrl !== undefined) {
      if (!userManga.currentSiteId) {
        throw new Error("No current site has been selected.");
      }

      const currentUserMangaSite = await ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId_and_siteId", (q) =>
          q.eq("userMangaId", id).eq("siteId", userManga.currentSiteId),
        )
        .unique();

      if (!currentUserMangaSite) {
        throw new Error("Current site configuration was not found.");
      }

      await ctx.db.patch(currentUserMangaSite._id, {
        siteUrl: data.siteUrl,
      });
    }

    await ctx.db.patch(id, {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.currentChapter !== undefined
        ? { currentChapter: data.currentChapter }
        : {}),
      ...(data.lastReadAt !== undefined
        ? { lastReadAt: data.lastReadAt }
        : {}),
      ...(data.scroll !== undefined ? { scroll: data.scroll } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.currentSiteId !== undefined
        ? { currentSiteId: data.currentSiteId }
        : {}),
    });

    return id;
  },
});

// ─── Delete Manga ────────────────────────────────────────────────────────────

export const deleteManga = mutation({
  args: {
    id: v.id("userMangas"),
  },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);

    const userManga = await ctx.db.get(id);

    if (!userManga || userManga.userId !== user._id) {
      throw new Error("Not found or unauthorized.");
    }

    const userMangaSites = await ctx.db
      .query("userMangaSites")
      .withIndex("by_userMangaId", (q) => q.eq("userMangaId", id))
      .collect();

    await Promise.all(
      userMangaSites.map((userMangaSite) =>
        ctx.db.delete(userMangaSite._id),
      ),
    );

    await ctx.db.delete(id);

    return id;
  },
});

// ─── List Manga ──────────────────────────────────────────────────────────────

export const listManga = query({
  args: {},
  handler: async (ctx): Promise<MangaResult[]> => {
    const user = await requireUser(ctx);

    const userMangas = await ctx.db
      .query("userMangas")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return Promise.all(
      userMangas.map(async (userManga): Promise<MangaResult> => {
        const [manga, userMangaSites] = await Promise.all([
          ctx.db.get(userManga.mangaId),
          ctx.db
            .query("userMangaSites")
            .withIndex("by_userMangaId", (q) =>
              q.eq("userMangaId", userManga._id),
            )
            .collect(),
        ]);

        const currentUserSite = userManga.currentSiteId
          ? userMangaSites.find(
              (userMangaSite) =>
                userMangaSite.siteId === userManga.currentSiteId,
            )
          : undefined;

        const currentSite = currentUserSite
          ? await ctx.db.get(currentUserSite.siteId)
          : null;

        return {
          id: userManga._id,
          MangaDexId: manga?.mangadexId ?? "",
          coverImage: manga?.coverImage ?? "",
          title: userManga.title,
          altTitles: manga?.titles ?? [],
          currentChapter: userManga.currentChapter,
          lastReadAt: userManga.lastReadAt,
          status: userManga.status,
          scroll: userManga.scroll,
          domainName: currentSite?.domainName ?? null,
          site: currentUserSite?.siteUrl ?? null,
          siteLogo: currentSite?.logo ?? null,
          altSite: userMangaSites.map(
            (userMangaSite) => userMangaSite.siteUrl,
          ),
        };
      }),
    );
  },
});

// ─── Get Manga ───────────────────────────────────────────────────────────────

export const getManga = query({
  args: {
    id: v.id("userMangas"),
  },
  handler: async (ctx, { id }): Promise<MangaResult | null> => {
    const user = await requireUser(ctx);

    const userManga = await ctx.db.get(id);

    if (!userManga || userManga.userId !== user._id) {
      return null;
    }

    const [manga, userMangaSites] = await Promise.all([
      ctx.db.get(userManga.mangaId),
      ctx.db
        .query("userMangaSites")
        .withIndex("by_userMangaId", (q) => q.eq("userMangaId", id))
        .collect(),
    ]);

    const currentUserSite = userManga.currentSiteId
      ? userMangaSites.find(
          (userMangaSite) =>
            userMangaSite.siteId === userManga.currentSiteId,
        )
      : undefined;

    const currentSite = currentUserSite
      ? await ctx.db.get(currentUserSite.siteId)
      : null;

    return {
      id: userManga._id,
      MangaDexId: manga?.mangadexId ?? "",
      coverImage: manga?.coverImage ?? "",
      title: userManga.title,
      altTitles: manga?.titles ?? [],
      currentChapter: userManga.currentChapter,
      lastReadAt: userManga.lastReadAt,
      status: userManga.status,
      scroll: userManga.scroll,
      domainName: currentSite?.domainName ?? null,
      site: currentUserSite?.siteUrl ?? null,
      siteLogo: currentSite?.logo ?? null,
      altSite: userMangaSites.map(
        (userMangaSite) => userMangaSite.siteUrl,
      ),
    };
  },
});