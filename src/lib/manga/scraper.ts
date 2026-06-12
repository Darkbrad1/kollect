// import type { Manga, user} from "./types"
import { extractChapterNumber, getHostname, normalizeTitle } from "./parser";
import type { TabStatus } from "~/settings/appSetting";

export function getSelectedOptions(
  doc: Document = document,
): HTMLOptionElement[] {
  return Array.from(doc.querySelectorAll("select option:checked"));
}

export function buildMangaDataFromDocument(
  site: string,
  scroll: number,
  doc: Document = document,
) {
  const pageTitle = doc.title || "";
  const ogTitle =
    doc
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
      ?.trim() || "";
  const iconEl = doc.querySelector(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );
  
  const webpageIcon = iconEl?.href || "";
  const selectedOptions = getSelectedOptions(doc);
  const normalizedTitle = normalizeTitle(ogTitle || pageTitle);
  const chapterNumber = extractChapterNumber(
    pageTitle,
    ogTitle,
    selectedOptions,
  );
  let status: TabStatus = "planned";
  if (chapterNumber > 1) {
    status = "reading";
  }

  return {
    title: normalizedTitle,
    currentChapter: chapterNumber ?? 0,
    lastReadAt: Date.now(),
    scroll: scroll,
    domainName: getHostname(site),
    site: site,
    siteLogo: webpageIcon,
    status: status,
  };
}
