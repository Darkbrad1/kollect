import { Button } from "./ui/button"

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
export default function SignIn() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-bold">Kollect</h1>

      <Button onClick={openSignInPage}>Sign in</Button>
      <Button variant="outline" onClick={openSignUpPage}>
        Sign up
      </Button>
    </div>
  )
}
