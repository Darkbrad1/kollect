// import type { Manga, user} from "./types"
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
) {
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
  console.log(
    "title: ",
    normalizedTitle,
    "chapter: ",
    chapterNumber,
    "lastReadAt: ",
    Date.now(),
    "scroll: ",
    scroll,
    "domain Name: ",
    getHostname(url),
    "url: ",
    url,
  )
  
  return {
    title: normalizedTitle,
    currentChapter: chapterNumber ?? 0,
    lastReadAt: Date.now(),
    scroll: scroll,
    domainName: getHostname(url),
    url: url,
  }
}