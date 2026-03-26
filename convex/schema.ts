import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    Manga: defineTable({
        user_id: v.string(),
        display_title: v.string(),
        cover_url: v.string(),
        alternative_titles: v.array(v.string()),
        chapter_number: v.float64(),
        last_read_timeStamp: v.number(),
        scroll_percentage: v.float64(),
        status: v.union(
            v.literal("reading"),
            v.literal("planned"),
            v.literal("hiatus"),
            v.literal("archived"),
        ),
        site_name: v.string(),
        site_url: v.string(),
        alternative_sites: v.array(v.string()),
        mangadex_id: v.string(),
    })
        .index("by_user_id", ["user_id"])
        .index("by_user_and_title", ["user_id", "display_title"]),
});
