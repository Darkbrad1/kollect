import { ClerkProvider, Show, SignIn, SignUp } from "@clerk/chrome-extension"

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error("Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY")
}

function getMode() {
  const params = new URLSearchParams(window.location.search)
  const mode = params.get("mode")

  if (mode === "sign-up") {
    return "sign-up"
  }

  return "sign-in"
}

export default function AuthPage() {
  const mode = getMode()
  const popupUrl = chrome.runtime.getURL("popup.html")

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl={popupUrl}
      signInFallbackRedirectUrl={popupUrl}
      signUpFallbackRedirectUrl={popupUrl}>
      <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Kollect Auth</h1>
          <p className="text-sm text-gray-600">
            Sign in or create your account
          </p>
        </div>
        <SignIn />
      </div>
    </ClerkProvider>
  )
}
