// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

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

export default http;
