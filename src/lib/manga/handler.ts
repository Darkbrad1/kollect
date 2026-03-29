import type { Manga } from "./types"

import { isSameHostname } from "./parser"
import { addManga, findExistingManga, updateManga } from "./repository"

export async function handleAddManga(newData: Manga, token: string) {
  const existing = await findExistingManga(
    newData.display_title,
    token,
    newData.site_url
  )

  console.log("Handling add manga. Existing manga found:", existing)

  if (existing) {
    await updateManga(
      existing._id!,
      {
        last_read_timeStamp: Date.now(),
        scroll_percentage: Math.max(
          existing.scroll_percentage,
          newData.scroll_percentage
        ),
        chapter_number: Math.max(
          existing.chapter_number,
          newData.chapter_number
        ),
        alternative_sites: [
          ...new Set([...existing.alternative_sites, newData.site_url])
        ],
        alternative_titles: [
          ...new Set([...existing.alternative_titles, newData.display_title])
        ],
        site_name: newData.site_name,
        site_url: newData.site_url
      },
      token
    )

    return
  }

  await addManga(newData, token)
}

export async function handleProgressUpdate(newData: Manga, token: string) {
  const manga = await findExistingManga(
    newData.display_title,
    token,
    newData.site_url
  )

  console.log("Handling progress update for manga:", manga)

  if (!manga) return
  if (newData.chapter_number !== manga.chapter_number) return
  if (newData.scroll_percentage < manga.scroll_percentage) return

  await updateManga(
    manga._id!,
    {
      scroll_percentage: newData.scroll_percentage,
      last_read_timeStamp: Date.now()
    },
    token
  )
}

export async function handleChapterUpdate(newData: Manga, token: string) {
  const manga = await findExistingManga(
    newData.display_title,
    token,
    newData.site_url
  )

  console.log("Handling chapter update for manga:", manga)

  if (!manga) {
    await addManga(newData, token)
    return
  }

  const sameSource = isSameHostname(newData.site_url, manga.site_url)
  const chapterIncreased = newData.chapter_number > manga.chapter_number
  const oldScrollPassedThreshold = manga.scroll_percentage > 50

  if (!chapterIncreased || !oldScrollPassedThreshold) return

  if (sameSource) {
    await updateManga(
      manga._id!,
      {
        chapter_number: newData.chapter_number,
        last_read_timeStamp: Date.now(),
        scroll_percentage: newData.scroll_percentage,
        site_name: newData.site_name,
        site_url: newData.site_url
      },
      token
    )

    return
  }

  await updateManga(
    manga._id!,
    {
      chapter_number: newData.chapter_number,
      last_read_timeStamp: Date.now(),
      scroll_percentage: newData.scroll_percentage,
      site_name: newData.site_name,
      site_url: newData.site_url,
      alternative_sites: [
        ...new Set([...manga.alternative_sites, newData.site_url])
      ],
      alternative_titles: [
        ...new Set([...manga.alternative_titles, newData.display_title])
      ]
    },
    token
  )
}