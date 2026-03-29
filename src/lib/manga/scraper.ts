import type { Manga } from "./types"
import { extractChapterNumber, getHostname, normalizeTitle } from "./parser"

export function getSelectedOptions(
  doc: Document = document
): HTMLOptionElement[] {
  return Array.from(doc.querySelectorAll("select option:checked"))
}

export function buildMangaDataFromDocument(
  url: string,
  scroll: number,
  doc: Document = document
): Manga {
  const pageTitle = doc.title || ""
  const ogTitle =
    doc
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
      ?.trim() || ""

  const selectedOptions = getSelectedOptions(doc)
  const normalizedTitle = normalizeTitle(ogTitle || pageTitle)
  const chapterNumber = extractChapterNumber(
    pageTitle,
    ogTitle,
    selectedOptions
  )

  return {
    display_title: normalizedTitle,
    cover_url: "",
    alternative_titles: normalizedTitle ? [normalizedTitle] : [],
    chapter_number: chapterNumber ?? 0,
    last_read_timeStamp: Date.now(),
    scroll_percentage: scroll,
    status: "reading",
    site_name: getHostname(url),
    site_url: url,
    alternative_sites: [url],
    mangadex_id: ""
  }
}