import type { Id } from "convex/_generated/dataModel"

import { api } from "convex/_generated/api"

import { createAuthedConvexClient } from "~lib/convexHttp"

import { getHostname, normalizeTitle } from "./parser"
import type { Manga, PartialManga } from "./types"

export async function fetchMangas(token: string) {
  const convex = createAuthedConvexClient(token)
  return await convex.query(api.manga.listManga)
}

export async function addManga(data: Manga, token: string) {
  const convex = createAuthedConvexClient(token)

  await convex.mutation(api.manga.createManga, {
    display_title: data.display_title,
    cover_url: data.cover_url,
    alternative_titles: data.alternative_titles,
    chapter_number: data.chapter_number,
    last_read_timeStamp: data.last_read_timeStamp,
    scroll_percentage: data.scroll_percentage,
    status: data.status,
    site_name: data.site_name,
    site_url: data.site_url,
    alternative_sites: data.alternative_sites,
    mangadex_id: data.mangadex_id
  })
}

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

export async function findExistingManga(
  title: string,
  token: string,
  url?: string
) {
  const mangas = await fetchMangas(token)
  const normalizedTitle = normalizeTitle(title)
  const hostname = url ? getHostname(url) : ""

  const exactMatch = mangas.find((manga) => {
    if (normalizeTitle(manga.display_title) === normalizedTitle) {
      return true
    }

    return manga.alternative_titles.some(
      (alt) => normalizeTitle(alt) === normalizedTitle
    )
  })

  if (exactMatch) return exactMatch

  if (!hostname) return undefined

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