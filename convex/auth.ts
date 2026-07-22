export async function requireUser(ctx: {
    auth: {
        getUserIdentity: () => Promise<{ subject: string } | null>;
    };
    db: any;
}) {
  // console.log("step 1")
  const identity = await ctx.auth.getUserIdentity();
  // console.log("step 2", identity)
  
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .first();
    console.log("step 3", user)
    if (!user) throw new Error("User not found");
    return user;
}
