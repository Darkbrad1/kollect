import { mutation } from "./_generated/server";

export const seedTestData = mutation({
    args: {},
    handler: async (ctx) => {
        // Sites
        const site1Id = await ctx.db.insert("sites", {
            siteDomainName: "mangadex.org",
            siteLogo: "https://mangadex.org/favicon.ico",
        });

        const site2Id = await ctx.db.insert("sites", {
            siteDomainName: "mangaplus.shueisha.co.jp",
            siteLogo: "https://mangaplus.shueisha.co.jp/favicon.ico",
        });

        // Mangas
        const manga1Id = await ctx.db.insert("mangas", {
            coverUrl: "https://uploads.mangadex.org/covers/one-piece.jpg",
            mangadexId: "a1c7c817-4e59-43b7-9365-09675a149a6f",
            latestChapter: 1110,
        });

        const manga2Id = await ctx.db.insert("mangas", {
            coverUrl: "https://uploads.mangadex.org/covers/chainsaw-man.jpg",
            mangadexId: "a77742b1-befd-49a4-bff5-1ad4e6b0ef7b",
            latestChapter: 168,
        });

        const manga3Id = await ctx.db.insert("mangas", {
            coverUrl: "https://uploads.mangadex.org/covers/jjk.jpg",
            mangadexId: "c52b2ce3-7f95-469c-96b0-479524fb7a1a",
            latestChapter: 260,
        });

        // Manga Titles
        await ctx.db.insert("mangaTitles", {
            mangaId: manga1Id,
            title: "One Piece",
        });

        await ctx.db.insert("mangaTitles", {
            mangaId: manga2Id,
            title: "Chainsaw Man",
        });

        await ctx.db.insert("mangaTitles", {
            mangaId: manga3Id,
            title: "Jujutsu Kaisen",
        });

        // Users — clerkId must match the fake identity subject
        const user1Id = await ctx.db.insert("users", {
            clerkId: "fake_id",
        });

        const user2Id = await ctx.db.insert("users", {
            clerkId: "user_test_002",
        });

        // User Mangas
        const userManga1Id = await ctx.db.insert("userMangas", {
            userId: user1Id,
            mangaId: manga1Id,
            displayTitle: "One Piece",
            chapterNumber: 1095,
            lastReadAt: Date.now() - 1000 * 60 * 60 * 2,
            scrollPercentage: 0.75,
            status: "reading",
        });

        const userManga2Id = await ctx.db.insert("userMangas", {
            userId: user1Id,
            mangaId: manga2Id,
            displayTitle: "Chainsaw Man",
            chapterNumber: 155,
            lastReadAt: Date.now() - 1000 * 60 * 60 * 24,
            scrollPercentage: 1.0,
            status: "hiatus",
        });

        const userManga3Id = await ctx.db.insert("userMangas", {
            userId: user2Id,
            mangaId: manga3Id,
            displayTitle: "JJK",
            chapterNumber: 1,
            lastReadAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
            scrollPercentage: 0.0,
            status: "planned",
        });

        // User Manga Sites
        await ctx.db.insert("userMangaSites", {
            userMangaId: userManga1Id,
            siteId: site1Id,
            siteChapterUrl: "https://mangadex.org/chapter/one-piece-1095",
            current: true,
        });

        await ctx.db.insert("userMangaSites", {
            userMangaId: userManga2Id,
            siteId: site1Id,
            siteChapterUrl: "https://mangadex.org/chapter/chainsaw-man-155",
            current: true,
        });

        await ctx.db.insert("userMangaSites", {
            userMangaId: userManga2Id,
            siteId: site2Id,
            siteChapterUrl:
                "https://mangaplus.shueisha.co.jp/viewer/chainsaw-man-155",
            current: false,
        });

        await ctx.db.insert("userMangaSites", {
            userMangaId: userManga3Id,
            siteId: site1Id,
            siteChapterUrl: "https://mangadex.org/chapter/jjk-1",
            current: true,
        });

        return { success: true, message: "Test data seeded successfully." };
    },
});