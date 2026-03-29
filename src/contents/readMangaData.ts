import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"

import { buildMangaDataFromDocument } from "~lib/manga/scraper"

// Run this content script on all URLs.
//
// You may later narrow this if you only want supported manga sites.
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Track the last URL we processed so we can detect SPA navigation.
let currentUrl = location.href

// Track the last scroll percentage we sent so we do not spam updates.
let lastSentScroll = -1

// Return the current page scroll percentage.
//
// If the page is shorter than the viewport, consider it fully read.
function getScrollPercentage(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight

  if (docHeight <= 0) return 100

  // Keep 3 decimal places of precision.
  return Math.round((scrollTop / docHeight) * 100000) / 1000
}

// Limit how often a function can be scheduled.
//
// This version:
// - accepts the first call
// - ignores all further calls during the delay window
// - runs the original function after the delay
function throttle<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    // If a timer is already active, ignore this call.
    if (timeout !== null) return

    timeout = window.setTimeout(() => {
      fn(...args)
      timeout = null
    }, delay)
  }
}

// Send a reading progress update to the background.
//
// If force is false, ignore tiny scroll changes under 1%.
async function sendProgress(force = false) {
  const scroll = getScrollPercentage()

  if (!force && Math.abs(scroll - lastSentScroll) < 1) return

  lastSentScroll = scroll

  // Build manga data directly from the current page/document.
  const manga = buildMangaDataFromDocument(location.href, scroll)

  // Send to background. The background handler will resolve auth.
  await sendToBackground({
    name: "updateProgress",
    body: { manga }
  })
}

// Send a chapter change update when the URL changes.
async function sendChapterChange() {
  // Update our local URL tracker first so repeated checks do not
  // re-send the same chapter over and over.
  currentUrl = location.href

  // Reset scroll tracking because a new chapter is being processed.
  lastSentScroll = -1

  const manga = buildMangaDataFromDocument(
    currentUrl,
    getScrollPercentage()
  )

  await sendToBackground({
    name: "updateChapter",
    body: { manga }
  })
}

// Send a manual "add manga" request, usually triggered by context menu.
async function sendAddManga() {
  const manga = buildMangaDataFromDocument(
    location.href,
    getScrollPercentage()
  )

  await sendToBackground({
    name: "addManga",
    body: { manga }
  })
}

// Throttle scroll events so progress updates are not sent too frequently.
const onScroll = throttle(() => {
  void sendProgress()
}, 1000)

// Listen for scrolling and update progress periodically.
window.addEventListener("scroll", onScroll)

// If the tab becomes hidden, force-send progress so the latest state is saved.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    void sendProgress(true)
  }
})

// Also force-send progress when the page is being unloaded or discarded.
window.addEventListener("pagehide", () => {
  void sendProgress(true)
})

// Detect navigation on SPA sites where the URL changes without full page reload.
function watchSpaNavigation() {
  // Save references to the real history methods before wrapping them.
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  // Shared URL-change handler.
  //
  // If the current browser URL differs from the last tracked URL,
  // treat that as a chapter/page change and send fresh manga data.
  const handleUrlChange = () => {
    if (location.href !== currentUrl) {
      void sendChapterChange()
    }
  }

  // Wrap history.pushState so we can detect client-side navigation.
  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    handleUrlChange()
  }

  // Wrap history.replaceState for the same reason.
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    handleUrlChange()
  }

  // Detect browser back/forward navigation too.
  window.addEventListener("popstate", handleUrlChange)
}

// Start watching for SPA route changes.
watchSpaNavigation()

// Listen for messages from the background script.
//
// Right now this is used by the context menu item "Add manga".
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "add_manga") {
    void sendAddManga()
    sendResponse({ ok: true })
  }
})