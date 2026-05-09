const MENU_ID = "add-manga"

chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create(
      {
        id: MENU_ID,
        title: "Add manga",
        contexts: ["page", "selection", "link", "image", "video", "audio"]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "contextMenus.create failed:",
            chrome.runtime.lastError.message
          )
        }
      }
    )
  } catch (error) {
    console.error("Failed to create context menu:", error)
  }
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return
  if (!tab?.id) return

  chrome.tabs.sendMessage(tab.id, { type: "add_manga" }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        "tabs.sendMessage failed:",
        chrome.runtime.lastError.message
      )
    }
  })
})

export async function getStoredClerkToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("clerk_token")
  return result.clerk_token ?? null
}