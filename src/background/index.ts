const MENU_ID = "add-manga"

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: "Add manga",
    contexts: [
      "page",
      "selection",
      "link",
      "image",
      "video",
      "audio",
      "editable"
    ]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID) return
  if (!tab?.id) return

  chrome.tabs.sendMessage(tab.id, {
    type: "add_manga"
  })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "get-clerk-token") {
    chrome.storage.local.get("clerk_token").then((result) => {
      sendResponse(result.clerk_token ?? null)
    })

    return true
  }
})