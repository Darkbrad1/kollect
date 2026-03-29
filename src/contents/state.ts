/**
 * Shared mutable state for the content script.
 *
 * We keep this in one place so multiple modules can read and update it
 * without relying on file-level globals scattered across the codebase.
 */
export const contentState = {
  /**
   * The last URL we processed.
   *
   * Used to detect SPA navigation where the page changes without a full reload.
   */
  currentUrl: location.href,

  /**
   * The last scroll percentage we sent to the background.
   *
   * Used to avoid sending tiny progress updates too frequently.
   */
  lastSentScroll: -1
}