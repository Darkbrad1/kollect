import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const statusValidator = v.union(
  v.literal("reading"),
  v.literal("planned"),
  v.literal("hiatus"),
  v.literal("archived")
)

async function requireUser(ctx: {
  auth: {
    getUserIdentity: () => Promise<{
      subject: string
    } | null>
  }
}) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error("Unauthenticated")
  }

  return identity.subject
}

export const createManga = mutation({
  args: {
    display_title: v.string(),
    cover_url: v.string(),
    alternative_titles: v.array(v.string()),
    chapter_number: v.float64(),
    last_read_timeStamp: v.number(),
    scroll_percentage: v.float64(),
    status: statusValidator,
    site_name: v.string(),
    site_url: v.string(),
    alternative_sites: v.array(v.string()),
    mangadex_id: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx)

    const existing = await ctx.db
      .query("Manga")
      .withIndex("by_user_and_title", (q) =>
        q.eq("user_id", userId).eq("display_title", args.display_title)
      )
      .first()

    if (existing) {
      throw new Error("Manga already exists")
    }

    return await ctx.db.insert("Manga", {
      user_id: userId,
      ...args
    })
  }
})

export const updateManga = mutation({
  args: {
    id: v.id("Manga"),
    data: v.object({
      display_title: v.optional(v.string()),
      cover_url: v.optional(v.string()),
      alternative_titles: v.optional(v.array(v.string())),
      chapter_number: v.optional(v.float64()),
      last_read_timeStamp: v.optional(v.number()),
      scroll_percentage: v.optional(v.float64()),
      status: v.optional(statusValidator),
      site_name: v.optional(v.string()),
      site_url: v.optional(v.string()),
      alternative_sites: v.optional(v.array(v.string())),
      mangadex_id: v.optional(v.string())
    })
  },
  handler: async (ctx, { id, data }) => {
    const userId = await requireUser(ctx)

    const manga = await ctx.db.get(id)

    if (!manga || manga.user_id !== userId) {
      throw new Error("Manga not found or unauthorized")
    }

    await ctx.db.patch(id, data)
    return id
  }
})

export const deleteManga = mutation({
  args: {
    id: v.id("Manga")
  },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx)
    const manga = await ctx.db.get(id)
    if (!manga || manga.user_id !== userId) {
      throw new Error("Manga not found or unauthorized")
    }
    await ctx.db.delete(id)
    return id
  }
})

export const listManga = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx)
    return await ctx.db
      .query("Manga")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect()
  }
})

export const listMangaByStatus = query({
  args: {
    status: statusValidator
  },
  handler: async (ctx, { status }) => {
    const userId = await requireUser(ctx)
    return await ctx.db
      .query("Manga")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("status"), status))
      .collect()
  }
})

export const getMangaById = query({
  args: {
    id: v.id("Manga"),
  },
  handler: async (ctx, { id }) => {
    const userId = await requireUser(ctx);
    const manga = await ctx.db.get(id);

    if (!manga || manga.user_id !== userId) {
      throw new Error("Manga not found or unauthorized");
    }

    return manga;
  },
});