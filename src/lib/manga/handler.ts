import type { Manga } from "./types"

import { isSameHostname } from "./parser"
import { addManga, findExistingManga, updateManga } from "./repository"

// Handle a manual "add manga" action.
//
// If the manga already exists, merge the new information into the existing record.
// Otherwise create a fresh manga entry.
export async function handleAddManga(newData: Manga, token: string) {
  const existing = await findExistingManga(
    newData.display_title,
    token,
    newData.site_url
  )

  console.log("Handling add manga. Existing manga found:", existing)

  // If we already know this manga, merge useful fields instead of duplicating it.
  if (existing) {
    await updateManga(
      existing._id!,
      {
        // Update the read timestamp to mark this manga as recently accessed.
        last_read_timeStamp: Date.now(),

        // Never reduce recorded progress/chapter when manually adding.
        scroll_percentage: Math.max(
          existing.scroll_percentage,
          newData.scroll_percentage
        ),
        chapter_number: Math.max(
          existing.chapter_number,
          newData.chapter_number
        ),

        // Merge known alternative URLs/titles without duplicates.
        alternative_sites: [
          ...new Set([...existing.alternative_sites, newData.site_url])
        ],
        alternative_titles: [
          ...new Set([...existing.alternative_titles, newData.display_title])
        ],

        // Use the latest source as the active one.
        site_name: newData.site_name,
        site_url: newData.site_url
      },
      token
    )

    return
  }

  // Otherwise create a brand-new manga entry.
  return await addManga(newData, token)
}

// Handle scroll/progress updates from the reader page.
export async function handleProgressUpdate(newData: Manga, token: string) {
  const manga = await findExistingManga(
    newData.display_title,
    token,
    newData.site_url
  )

  console.log("Handling progress update for manga:", manga)

  // If no matching manga exists, there is nothing to update.
  if (!manga) return

  // Only update progress if we are still on the same chapter.
  if (newData.chapter_number !== manga.chapter_number) return

  // Never overwrite with a lower scroll value.
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

// Handle chapter transitions, especially on SPA reader sites.
export async function handleChapterUpdate(newData: Manga, token: string) {
  const manga = await findExistingManga(
    newData.display_title,
    token,
    newData.site_url
  )

  console.log("Handling chapter update for manga:", manga)
  console.log("newData:", newData)

  // If this manga is not known yet, create it immediately.
  if (!manga) {
    // await addManga(newData, token)
    return
  }

  // Determine whether this update is a valid chapter advance.
  const sameSource = isSameHostname(newData.site_url, manga.site_url)
  const chapterIncreased = newData.chapter_number > manga.chapter_number
  const chapterDelta = newData.chapter_number - manga.chapter_number

  // Allow the update if the user read enough of the previous chapter,
  // or if they jumped ahead by more than one chapter intentionally.
  const oldScrollPassedThreshold =
    manga.scroll_percentage > 0 || chapterDelta > 1

  if (!chapterIncreased || !oldScrollPassedThreshold) return

  // If the user stayed on the same source/domain, update normally.
  if (sameSource) {
    console.log(
      "Chapter increased on the same source. Updating chapter number and resetting scroll."
    )
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

  // If they switched to another source, update the active source and
  // also preserve the new site/title in the alternatives list.
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