import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"

import { buildMangaDataFromDocument } from "~lib/manga/scraper"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

let currentUrl = location.href
let lastSentScroll = -1

function getScrollPercentage(): number {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight

  if (docHeight <= 0) return 100

  return Math.round((scrollTop / docHeight) * 100000) / 1000
}

function throttle<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: number | null = null

  return (...args: Parameters<T>) => {
    if (timeout !== null) return

    timeout = window.setTimeout(() => {
      fn(...args)
      timeout = null
    }, delay)
  }
}

async function getAuthToken() {
  return await chrome.runtime.sendMessage({
    type: "get-clerk-token"
  })
}

async function sendProgress(force = false) {
  const scroll = getScrollPercentage()

  if (!force && Math.abs(scroll - lastSentScroll) < 1) return

  lastSentScroll = scroll

  const token = await getAuthToken()

  if (!token) return

  const manga = buildMangaDataFromDocument(location.href, scroll)

  await sendToBackground({
    name: "updateProgress",
    body: { manga, token }
  })
}

async function sendChapterChange() {
  currentUrl = location.href
  lastSentScroll = -1

  const token = await getAuthToken()

  if (!token) return

  const manga = buildMangaDataFromDocument(
    currentUrl,
    getScrollPercentage()
  )

  await sendToBackground({
    name: "updateChapter",
    body: { manga, token }
  })
}

async function sendAddManga() {
  const token = await getAuthToken()

  if (!token) return

  const manga = buildMangaDataFromDocument(
    location.href,
    getScrollPercentage()
  )

  await sendToBackground({
    name: "addManga",
    body: { manga, token }
  })
}

const onScroll = throttle(() => {
  void sendProgress()
}, 1000)

window.addEventListener("scroll", onScroll)

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    void sendProgress(true)
  }
})

window.addEventListener("pagehide", () => {
  void sendProgress(true)
})

function watchSpaNavigation() {
  const originalPushState = history.pushState
  const originalReplaceState = history.replaceState

  const handleUrlChange = () => {
    if (location.href !== currentUrl) {
      void sendChapterChange()
    }
  }

  history.pushState = function (...args) {
    originalPushState.apply(this, args)
    handleUrlChange()
  }

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args)
    handleUrlChange()
  }

  window.addEventListener("popstate", handleUrlChange)
}

watchSpaNavigation()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "add_manga") {
    void sendAddManga()
    sendResponse({ ok: true })
  }
})