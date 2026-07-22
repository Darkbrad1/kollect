// Unique ID for the context menu item
const MENU_ID = "add-manga"

// Runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  try {
    // Create a context menu item that appears on many types of page elements
    chrome.contextMenus.create(
      {
        id: MENU_ID,
        title: "Add manga",
        contexts: ["page", "selection", "link", "image", "video", "audio"]
      },
      () => {
        // If Chrome reports an error during creation, log it
        if (chrome.runtime.lastError) {
          console.error(
            "contextMenus.create failed:",
            chrome.runtime.lastError.message
          )
        }
      }
    )
  } catch (error) {
    // Catch unexpected errors thrown while creating the menu
    console.error("Failed to create context menu:", error)
  }
})

// Listen for clicks on any extension context menu item
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Ignore clicks for other menu items
  if (info.menuItemId !== MENU_ID) return

  // Stop if the current tab does not have a valid ID
  if (!tab?.id) return

  // Send a message to the content script in the clicked tab
  chrome.tabs.sendMessage(tab.id, { type: "add_manga" }, () => {
    // Log an error if no receiver exists or sending fails
    if (chrome.runtime.lastError) {
      console.error(
        "tabs.sendMessage failed:",
        chrome.runtime.lastError.message
      )
    }
  })
})

// Get the stored Clerk auth token from extension local storage
export async function getStoredClerkToken(): Promise<string | null> {
  // Read the "clerk_token" value from chrome.storage.local
  const result = await chrome.storage.session.get("clerk_token")

  // Return the token if it exists, otherwise return null
  return result.clerk_token ?? null
}