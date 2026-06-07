import { toast } from "sonner"

import { sendToBackground } from "@plasmohq/messaging"

import { buildMangaDataFromDocument } from "~/lib/manga/scraper"

import { contentState } from "../state"
import { getScrollPercentage } from "./scroll"



/**
 * Send a manual "add manga" request.
 *
 * This is usually triggered from the background script, for example
 * by a context menu action.
 */
export async function sendAddManga() {
  const manga = buildMangaDataFromDocument(location.href, getScrollPercentage())
  const result = await sendToBackground({
    name: "addManga",
    body: { manga }
  })
  if (!result) {
    toast.error(`Something went wrong while adding ${manga.title}`, {
      description: "check if the manga is already added"
    })
  } else {
    toast.success(`${manga.title} was added successfully`)
  }
}

/**
 * Send a reading progress update to the background.
 *
 * If force is false, very small scroll changes under 1% are ignored
 * so we do not spam updates while the user is reading.
 */
export async function sendProgress(force = false) {
  const scroll = getScrollPercentage()
  if (!force && Math.abs(scroll - contentState.lastSentScroll) < 1) return
  contentState.lastSentScroll = scroll

  // Build manga data directly from the current page.
  const manga = buildMangaDataFromDocument(location.href, scroll, "progress")
  console.log("scroll Position: ", manga.scroll)

  // The background message handler is responsible for auth/server work.
  const result = await sendToBackground({
    name: "updateProgress",
    body: { manga }
  })
}





/**
 * Send a chapter/page change update when the URL changes.
 *
 * This is especially useful for SPA-based manga sites where navigation
 * happens through history APIs instead of full page loads.
 */
export async function sendChapterChange() {
  // Update our local URL tracker first so repeated checks do not resend.
  contentState.currentUrl = location.href
  // Reset scroll tracking because this is a fresh chapter/page context.
  contentState.lastSentScroll = -1

  const manga = buildMangaDataFromDocument(
    contentState.currentUrl,
    getScrollPercentage()
  )

  console.log("in sendChapterChange - ", manga)

  const result = await sendToBackground({
    name: "updateChapter",
    body: { manga }
  })
  if (!result){
    // toast.error(`Something went wrong while updating to chpater ${manga.currentChapter}`)
  }else{
    // toast.success(`upated ${manga.title} to chapter ${manga.currentChapter}`)
  }
}