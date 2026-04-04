import type { Id } from "convex/_generated/dataModel"

import { api } from "convex/_generated/api"

import { createAuthedConvexClient } from "~lib/convexHttp"

import { getHostname, normalizeTitle } from "./parser"
import type { Manga, PartialManga, MangaDexManga} from "./types"

// Fetch all mangas for the authenticated user from Convex.
export async function fetchMangas(token: string) {
  const convex = createAuthedConvexClient(token)
  return await convex.query(api.manga.listManga)
}
// Fetch the mangadex id for a given manga
export async function fetchMangaDexId(
  title: string,
  token: string
): Promise<MangaDexManga | undefined> {
  const convex = createAuthedConvexClient(token);
  const data = await convex.action(api.mangadex.searchMangaByTitle, {
    title,
  });

  return data[0];
}
// Create a manga document in Convex.
export async function addManga(data: Manga, token: string) {
  const convex = createAuthedConvexClient(token)
  const mangadex = await fetchMangaDexId(data.display_title, token)
  if (!mangadex) {
    console.log("No MangaDex match found for title:", data.display_title);
  }
  console.log("MangaDex search result:", mangadex);
  await convex.mutation(api.manga.createManga, {
    display_title: data.display_title,
    cover_url: mangadex?.cover_url || data.cover_url,
    alternative_titles: mangadex?.alternative_titles || data.alternative_titles,
    chapter_number: data.chapter_number,
    last_read_timeStamp: data.last_read_timeStamp,
    scroll_percentage: data.scroll_percentage,
    status: data.status,
    site_name: data.site_name,
    site_url: data.site_url,
    alternative_sites: data.alternative_sites,
    mangadex_id: mangadex?.id || data.mangadex_id
  })
}

// Update an existing manga document by ID.
export async function updateManga(
  id: Id<"Manga">,
  data: PartialManga,
  token: string
) {
  const convex = createAuthedConvexClient(token)

  await convex.mutation(api.manga.updateManga, {
    id,
    data
  })
}

// Find a manga that most likely matches the current scraped title/site.
//
// Matching strategy:
// 1. exact normalized title match
// 2. exact match against alternative titles
// 3. fallback to same-host + partial title similarity
export async function findExistingManga(
  title: string,
  token: string,
  url?: string
) {
  const mangas = await fetchMangas(token)
  const normalizedTitle = normalizeTitle(title)
  const hostname = url ? getHostname(url) : ""

  // First pass: exact normalized title matching.
  const exactMatch = mangas.find((manga) => {
    if (normalizeTitle(manga.display_title) === normalizedTitle) {
      return true
    }

    return manga.alternative_titles.some(
      (alt) => normalizeTitle(alt) === normalizedTitle
    )
  })

  if (exactMatch) return exactMatch

  // If no URL is available, we cannot do same-host fallback matching.
  if (!hostname) return undefined

  // Second pass: if the site matches, allow looser title matching.
  return mangas.find((manga) => {
    const urls = [manga.site_url, ...manga.alternative_sites]
    const sameHost = urls.some((site) => getHostname(site) === hostname)

    if (!sameHost) return false

    const display = normalizeTitle(manga.display_title)

    if (display.includes(normalizedTitle)) return true
    if (normalizedTitle.includes(display)) return true

    return manga.alternative_titles.some((alt) => {
      const normalizedAlt = normalizeTitle(alt)

      return (
        normalizedAlt.includes(normalizedTitle) ||
        normalizedTitle.includes(normalizedAlt)
      )
    })
  })
}

