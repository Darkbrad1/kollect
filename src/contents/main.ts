import type { PlasmoCSConfig } from "plasmo"

import { sendAddManga } from "./utils/senders"
import { registerWatchers } from "./utils/watchers"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "add_manga") {
    void sendAddManga()
    sendResponse({ ok: true })
  }
})

/**
 * If the URL contains a kollect-scroll hash, scroll to that percentage
 * once the page is fully loaded.
 */
function restoreScrollPosition() {
  const match = location.hash.match(/kollect-scroll=([\d.]+)/)
  if (!match) return

  const percentage = parseFloat(match[1])
  if (isNaN(percentage)) return

  const doScroll = () => {
    // Wait for dynamic content to settle before calculating scroll height
    setTimeout(() => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: (percentage / 100) * maxScroll, behavior: "smooth" })
    }, 1500)
  }

  if (document.readyState === "complete") {
    doScroll()
  } else {
    window.addEventListener("load", doScroll, { once: true })
  }
}

restoreScrollPosition()
registerWatchers()