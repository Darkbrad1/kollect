// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
    path: "/mangadex-cover",
    method: "GET",
    handler: httpAction(async (_ctx, req) => {
        const requestUrl = new URL(req.url);
        const target = requestUrl.searchParams.get("url");

        if (!target) return new Response("Missing url", { status: 400 });

        let targetUrl: URL;
        try {
            targetUrl = new URL(target);
        } catch {
            return new Response("Invalid url", { status: 400 });
        }

        // Allowlist to prevent open-proxy abuse
        if (targetUrl.hostname !== "uploads.mangadex.org") {
            return new Response("Blocked host", { status: 403 });
        }

        const upstream = await fetch(targetUrl.toString(), {
            headers: {
                Referer: "https://mangadex.org/",
                Origin: "https://mangadex.org",
                "User-Agent": "Mozilla/5.0",
            },
        });

        if (!upstream.ok) {
            return new Response(`Upstream error: ${upstream.status}`, {
                status: 502,
            });
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                "Content-Type":
                    upstream.headers.get("content-type") ??
                    "application/octet-stream",
                "Cache-Control": "public, max-age=86400",
            },
        });
    }),
});


http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) throw new Error("Missing CLERK_WEBHOOK_SECRET");

        const body = await request.text();

        const wh = new Webhook(webhookSecret);
        let evt: any;

        try {
            evt = wh.verify(body, {
                "svix-id": request.headers.get("svix-id")!,
                "svix-timestamp": request.headers.get("svix-timestamp")!,
                "svix-signature": request.headers.get("svix-signature")!,
            });
        } catch {
            return new Response("Invalid webhook signature", { status: 400 });
        }

        if (evt.type === "user.created") {
            await ctx.runMutation(internal.users.createUser, {
                clerkId: evt.data.id,
            });
        }

        return new Response(null, { status: 200 });
    }),
});


export default http;
