const MENU_ID = "add-manga"

// Create the context menu item when the extension is installed or updated.
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

// Listen for clicks on extension context menu items.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Ignore clicks for any menu item except our "Add manga" action.
  if (info.menuItemId !== MENU_ID) return

  // We need a valid tab ID to send a message to the content script.
  if (!tab?.id) return

  // Tell the content script in the current tab to add the manga
  // currently visible on the page.
  chrome.tabs.sendMessage(tab.id, {
    type: "add_manga"
  })
})