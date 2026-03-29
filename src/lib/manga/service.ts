import type { Manga } from "~/types"
import { findExistingManga, updateManga } from "./repository"
import { isSameHostname } from "./parsers"

export async function handleProgressUpdate(newData: Omit<Manga, "_id">) {
  const manga = await findExistingManga(newData.titles.displayTitle)

  if (!manga) return
  if (newData.chapter.number !== manga.chapter.number) return
  if (newData.chapter.scrollPercentage < manga.chapter.scrollPercentage) return

  await updateManga({
    id: manga._id,
    chapter: {
      ...manga.chapter,
      scrollPercentage: newData.chapter.scrollPercentage,
      lastRead: Date.now()
    }
  })
}

export async function handleChapterUpdate(newData: Omit<Manga, "_id">) {
  const manga = await findExistingManga(newData.titles.displayTitle)

  if (!manga) return

  const isSameSource = isSameHostname(
    newData.sources.default,
    manga.sources.default
  )

  const chapterIncreased = newData.chapter.number > manga.chapter.number
  const oldScrollPassedThreshold = manga.chapter.scrollPercentage > 50

  if (!chapterIncreased || !oldScrollPassedThreshold) return

  if (isSameSource) {
    await updateManga({
      id: manga._id,
      chapter: newData.chapter,
      sources: newData.sources
    })
    return
  }

  await updateManga({
    id: manga._id,
    chapter: newData.chapter,
    sources: {
      default: newData.sources.default,
      alternatives: [
        ...new Set([
          ...manga.sources.alternatives,
          newData.sources.default
        ])
      ]
    },
    titles: {
      ...manga.titles,
      alternatives: [
        ...new Set([
          ...manga.titles.alternatives,
          newData.titles.displayTitle
        ])
      ]
    }
  })
}