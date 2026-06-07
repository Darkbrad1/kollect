import type { PlasmoCSConfig } from "plasmo"

import { sendAddManga } from "./utils/senders"
import { registerWatchers } from "./utils/watchers"

// Configure this file as a Plasmo content script that runs on all URLs
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Listen for messages sent from the extension background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  // If the message tells this page to add manga, trigger that action
  if (message?.type === "add_manga") {
    void sendAddManga()

    // Respond to confirm the message was received successfully
    sendResponse({ ok: true })
  }
})

/**
 * If the URL contains a kollect-scroll hash, scroll to that percentage
 * once the page is fully loaded.
 */
function restoreScrollPosition() {
  // Look for a hash value like: #kollect-scroll=42.5
  const match = location.hash.match(/kollect-scroll=([\d.]+)/)

  // Stop if the hash does not contain the expected scroll value
  if (!match) return

  // Convert the captured percentage string into a number
  const percentage = parseFloat(match[1])

  // Stop if the parsed value is not a valid number
  if (isNaN(percentage)) return

  // Perform the scroll after giving the page time to finish rendering
  const doScroll = () => {
    // Wait for dynamic content to settle before calculating scroll height
    setTimeout(() => {
      // Calculate the maximum vertical scroll distance on the page
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight

      // Scroll to the saved percentage of the total page height
      window.scrollTo({
        top: (percentage / 100) * maxScroll,
        behavior: "smooth"
      })
    }, 1500)
  }

  // If the page is already fully loaded, scroll now
  if (document.readyState === "complete") {
    doScroll()
  } else {
    // Otherwise, wait until the page load event fires
    window.addEventListener("load", doScroll, { once: true })
  }
}

// Try to restore scroll position from the URL hash when the script loads
restoreScrollPosition()

// Start any DOM watchers or observers used by the extension
registerWatchers()