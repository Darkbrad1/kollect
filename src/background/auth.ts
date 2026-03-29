// Reads the stored Clerk token from extension local storage.
//
// This keeps token lookup inside the background layer so
// content scripts do not need to know anything about auth.
export async function getStoredClerkToken(): Promise<string | null> {
  const result = await chrome.storage.local.get("clerk_token")
  return result.clerk_token ?? null
}