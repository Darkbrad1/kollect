import { ClerkProvider, Show, UserButton } from "@clerk/chrome-extension"
import { ConvexProviderWithAuth } from "convex/react"

import { convex } from "~lib/convex"
import "~style.css"
import { useConvexClerkAuth } from "~lib/useConvexClerkAuth"

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error("Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY")
}

function openAuthPage(mode: "sign-in" | "sign-up") {
  const url = chrome.runtime.getURL(`tabs/auth.html`)
  chrome.tabs.create({ url })
}

export default function Popup() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithAuth client={convex} useAuth={useConvexClerkAuth}>
        <div className="min-w-[600px] min-h-[600px] p-4">
          <Show when="signed-out">
            <div className="flex flex-col gap-3">
              <h1 className="text-lg font-bold">Manga Tracker</h1>
              <button
                className="rounded bg-black px-4 py-2 text-white"
                onClick={() => openAuthPage("sign-in")}>
                Sign in
              </button>
              <button
                className="rounded border px-4 py-2"
                onClick={() => openAuthPage("sign-up")}>
                Sign up
              </button>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="mb-4 flex justify-between">
              <h1 className="font-bold">Manga Tracker</h1>
              <UserButton />
            </div>

            <MainApp />
          </Show>
        </div>
      </ConvexProviderWithAuth>
    </ClerkProvider>
  )
}

function MainApp() {
  return <div>Signed in</div>
}