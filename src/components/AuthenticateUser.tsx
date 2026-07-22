import { useEffect } from "react"
import { useConvexAuth, useMutation } from "convex/react"

import { api } from "../../convex/_generated/api"
import { Button } from "~/components/ui/button"
import AppPreview from "../../assets/appPreview.png"
import kollectLogo from "../../assets/kollect.png"

function openSignInPage() {
  chrome.tabs.create({
    url: "http://localhost:3000/sign-in",
  })
}

function openSignUpPage() {
  chrome.tabs.create({
    url: "http://localhost:3000/sign-up",
  })
}

export default function AuthenticateUser() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  const ensureUser = useMutation(api.users.ensureUser)

  useEffect(() => {
    if (!isAuthenticated) {
      return console.log("User is not authenticated")
    }

    void ensureUser().catch((error) => {
      console.error("Could not ensure Convex user:", error)
    })
  }, [ensureUser, isAuthenticated])

  if (isLoading) {
    return (
      <div className="grid h-[600px] place-items-center p-3 outline">
        <p>Checking your session...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="grid h-[600px] place-items-center p-3 outline">
        <div className="text-center">
          <img
            src={kollectLogo}
            alt="Kollect logo"
            className="mx-auto mb-4"
          />
          <h2>You are signed in.</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] flex-row gap-3 p-3 outline">
      <div className="h-full w-26 overflow-hidden rounded-lg">
        <img
          className="h-full translate-x-7 scale-125 object-cover"
          src={AppPreview}
          alt="App preview image"
        />
      </div>

      <div className="grid flex-1 place-content-center gap-4">
        <div className="grid">
          <img src={kollectLogo} alt="Kollect logo" className="mx-auto" />
          <h2>Kollect and save your favourite manga&apos;s</h2>
        </div>

        <div className="grid gap-2">
          <Button onClick={openSignInPage}>Sign in</Button>
          <Button onClick={openSignUpPage}>Sign up</Button>
        </div>
      </div>
    </div>
  )
}