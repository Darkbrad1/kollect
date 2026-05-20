export async function requireUser(ctx: {
    auth: {
        getUserIdentity: () => Promise<{ subject: string } | null>;
    };
    db: any;
}) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first();

    if (!user) throw new Error("User not found");
    return user;
}
