import "~style.css"

import { ClerkProvider, SignIn, SignUp } from "@clerk/chrome-extension"

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const EXTENSION_URL = chrome.runtime.getURL(".")
console.log(EXTENSION_URL)


if (!PUBLISHABLE_KEY) {
  throw new Error("Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY")
}

export default function AuthPage() {
  const mode =
    new URLSearchParams(window.location.search).get("mode") === "sign-up"
      ? "sign-up"
      : "sign-in"

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl={`${EXTENSION_URL}tabs/auth.html`}
      signInFallbackRedirectUrl={`${EXTENSION_URL}tabs/auth.html`}
      signUpFallbackRedirectUrl={`${EXTENSION_URL}tabs/auth.html`}>
      <div className="grid place-content-center min-h-screen">
        {mode === "sign-in" ? (
          <SignIn routing="hash" />
        ) : (
          <SignUp routing="hash" />
        )}
      </div>
    </ClerkProvider>
  )
}