import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
    args: { clerkId: v.string() },
    handler: async (ctx, { clerkId }) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
            .first();

        if (!existing) {
            await ctx.db.insert("users", { clerkId });
        }
    },
});