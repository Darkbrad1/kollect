// import type { Manga, user} from "./types"
import { extractChapterNumber, getHostname, normalizeTitle } from "./parser";

export function getSelectedOptions(
  doc: Document = document,
): HTMLOptionElement[] {
  return Array.from(doc.querySelectorAll("select option:checked"));
}

export function buildMangaDataFromDocument(
  url: string,
  scroll: number,
  type: "all" | "progress" = "all",
  doc: Document = document,
) {
  const pageTitle = doc.title || "";
  const ogTitle =
    doc
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
      ?.trim() || "";

  const selectedOptions = getSelectedOptions(doc);
  const normalizedTitle = normalizeTitle(ogTitle || pageTitle);
  const chapterNumber = extractChapterNumber(
    pageTitle,
    ogTitle,
    selectedOptions,
  );

  if (type === "all") {
    return {
      title: normalizedTitle,
      currentChapter: chapterNumber ?? 0,
      lastReadAt: Date.now(),
      scroll: scroll,
      domainName: getHostname(url),
      url: url,
    };
  }

  if (type === "progress") {
    return {
      title: normalizedTitle,
      currentChapter: chapterNumber ?? 0,
      lastReadAt: Date.now(),
      scroll: scroll,
    };
  }
}
