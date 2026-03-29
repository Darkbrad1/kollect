import { useEffect } from "react"

import { ClerkProvider, Show, UserButton, useAuth } from "@clerk/chrome-extension"
import { ConvexProviderWithAuth } from "convex/react"

import AddMangaButton from "~components/AddMangaButton"
import { AppStateProvider } from "~components/AppStateProvider"
import RenderMangas from "~components/RenderMangas"
import { Button } from "~components/ui/button"
import { Input } from "~components/ui/input"
import { convex } from "~lib/convex"
import { useConvexClerkAuth } from "~lib/useConvexClerkAuth"

import "~style.css"

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error("Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY")
}

function openSignInPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("tabs/auth.html?mode=sign-in")
  })
}

function openSignUpPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("tabs/auth.html?mode=sign-up")
  })
}

function ClerkTokenSync() {
  const { isSignedIn, getToken } = useAuth()

  useEffect(() => {
    async function syncToken() {
      if (!isSignedIn) {
        await chrome.storage.local.remove("clerk_token")
        return
      }

      const token = await getToken({
        template: "convex"
      })

      if (token) {
        await chrome.storage.local.set({ clerk_token: token })
      }
    }

    void syncToken()
  }, [getToken, isSignedIn])

  return null
}

export default function Popup() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl="/popup.html">
      <ClerkTokenSync />
      <ConvexProviderWithAuth client={convex} useAuth={useConvexClerkAuth}>
        <div className="min-h-[600px] min-w-[800px] p-4">
          <Show when="signed-out">
            <div className="flex flex-col gap-3">
              <h1 className="text-lg font-bold">Manga Tracker</h1>

              <Button onClick={openSignInPage}>Sign in</Button>
              <Button variant="outline" onClick={openSignUpPage}>
                Sign up
              </Button>
              <Input />
            </div>
          </Show>

          <Show when="signed-in">
            <AppStateProvider>
              <div className="mb-4 flex justify-between">
                <h1 className="font-bold">Manga Tracker</h1>
                <UserButton />
              </div>
              <AddMangaButton />
              <RenderMangas />
            </AppStateProvider>
          </Show>
        </div>
      </ConvexProviderWithAuth>
    </ClerkProvider>
  )
}