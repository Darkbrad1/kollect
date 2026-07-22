import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const ensureUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    // User already exists, so do nothing.
    if (existingUser) {
      return existingUser._id;
    }

    // Create the user only when they do not exist.
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
    });
  },
});

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