import type { PlasmoCSConfig } from "plasmo"

import { sendAddManga } from "./senders"
import { registerWatchers } from "./utils/watchers"

/**
 * Run this content script on all URLs.
 *
 * You can narrow this later if you only want supported manga sites.
 */
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

/**
 * Listen for messages from the background script.
 *
 * Right now this is used by the context menu item that manually adds
 * the currently open manga to the user's library.
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "add_manga") {
    void sendAddManga()
    sendResponse({ ok: true })
  }
})

/**
 * Start all content-script watchers after the file loads.
 */
registerWatchers()
