import { sendChapterChange } from "./senders";
import {sendProgress } from "./senders";
import { contentState } from "../state";
import { throttle } from "./throttle";

/** 
 * Throttled scroll handler so progress updates are not sent on every
 * single scroll event fired by the browser.
 */
const onScroll = throttle(() => {
    void sendProgress();
}, 1000);

/**
 * Register all page/browser watchers used by the content script.
 *
 * Keeping this setup in one place makes main.ts much smaller and easier
 * to reason about.
 */
export function registerWatchers() {
  console.log("registerWatcher")
    window.addEventListener("scroll", onScroll);

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            void sendProgress(true);
        }
    });

    window.addEventListener("pagehide", () => {
        void sendProgress(true);
    });

    // Send chapter data on initial page load.
    void sendChapterChange();

    watchSpaNavigation();
}







/**
 * Detect navigation on SPA sites.
 *
 * We wrap history.pushState and history.replaceState, then also listen
 * for popstate so browser back/forward navigation is covered as well.
 */
function watchSpaNavigation() {
    // Save references to the original history methods before wrapping them.
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    /**
     * Shared URL-change handler.
     *
     * If the current browser URL differs from the last tracked URL,
     * treat that as a chapter/page change.
     */

  
    const handleUrlChange = () => {
        if (location.href !== contentState.currentUrl) {
            void sendChapterChange();
        }
    };

    // Wrap history.pushState so client-side route changes can be detected.
    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        handleUrlChange();
    };

    // Wrap history.replaceState for the same reason.
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        handleUrlChange();
    };

    // Detect browser back/forward navigation too.
    window.addEventListener("popstate", handleUrlChange);
}
