import { scanlationSources } from "./constants"

export function isSameHostname(url1: string, url2: string): boolean {
  try {
    return (
      new URL(url1).hostname.toLowerCase() ===
      new URL(url2).hostname.toLowerCase()
    )
  } catch {
    return false
  }
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ""
  }
}

export function normalizeTitle(title: string): string {
  let rawTitle = title.toLowerCase().replace(/\s{2,}/g, " ").trim()

  const sourceRegex = new RegExp(
    `\\s*[-–—:|•]?\\s*(${scanlationSources
      .map((source) => source.replace(/\./g, "\\."))
      .join("|")})\\s*$`,
    "i"
  )

  const splitByPipe = rawTitle.split("|").map((part) => part.trim())
  if (
    splitByPipe.length >= 3 &&
    /^(chapter|ch\.?|episode|ep\.?)\s*\d+(\.\d+)?/i.test(splitByPipe[0])
  ) {
    rawTitle = splitByPipe[1]
  }

  const splitByBullet = rawTitle.split("•")
  if (splitByBullet.length > 1 && splitByBullet[1].trim().length < 30) {
    rawTitle = splitByBullet[0].trim()
  }

  rawTitle = rawTitle.replace(sourceRegex, "").trim()

  const chapterAtStartMatch = rawTitle.match(
    /^(chapter|ch\.?|episode|ep\.?)\s*\d+(\.\d+)?(\s*\([^)]+\))?\s*[-–—:|,]\s*(.+)$/i
  )

  if (chapterAtStartMatch) {
    rawTitle = chapterAtStartMatch[4].trim()
  }

  const chapterAtEndMatch = rawTitle.match(
    /^(.+?)\s+(ch\.|chapter|vol\.|volume|lv\.|episode|ep)\s*\d+(\.\d+)?(\s*\([^)]+\))?$/i
  )

  if (chapterAtEndMatch) {
    rawTitle = chapterAtEndMatch[1].trim()
  }

  const chapterVolRegex =
    /^(.+?)(?:\s+(chapter|vol\.|volume|lv\.|manga|ch\.|episode|ep)\b)/i
  const match = rawTitle.match(chapterVolRegex)

  if (match) {
    rawTitle = match[1].trim()
  }

  rawTitle = rawTitle
    .replace(/\|/g, "")
    .replace(/\s*[-–—:|•]+\s*$/g, "")
    .trim()

  return rawTitle
}

export function extractChapterNumber(
  title: string,
  ogTitle: string,
  selectedOptions: HTMLOptionElement[]
): number | undefined {
  const chapterRegex = /(chapter|ch|episode|ep)[\s.-]*\d+(\.\d+)?/gi
  const numberRegex = /\d+(\.\d+)?/g

  const chapterFromTitle =
    title.match(chapterRegex) || ogTitle.match(chapterRegex)

  if (chapterFromTitle?.[0]) {
    const match = chapterFromTitle[0].match(numberRegex)
    return match ? Number(match[0]) : undefined
  }

  if (selectedOptions.length > 0) {
    const values = selectedOptions
      .map((option) => {
        const match = option.textContent?.match(/\d+(\.\d+)?/g)?.[0]
        return match ? Number(match) : NaN
      })
      .filter((num) => !Number.isNaN(num))

    return values[0]
  }

  return undefined
}