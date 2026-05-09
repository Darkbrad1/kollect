import { Button } from "~/components/ui/button"
import AppPreview from "~assets/appPreview.png"
import kollectLogo from "~assets/kollect.png"

// import AppPreview from '../../assets/appPreview.png'

function openSignInPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("tabs/auth.html?mode=sign-in")
  })
  // chrome.tabs.create({
  //   url: "https://kollect-auth.vercel.app/sign-in",
  // });
}
function openSignUpPage() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("tabs/auth.html?mode=sign-up")
  })
}
export default function SignIn() {
  return (
    <div className="flex flex-row gap-3 p-3 outline h-[600px]">
      <div className="h-full overflow-hidden rounded-lg w-26">
        <img
          className="object-cover h-full scale-125 translate-x-7 translat"
          src={AppPreview}
          alt="App preview image"
        />
      </div>
      <div className="flex-1 grid place-content-center gap-4">
        <div className="grid">
          <img src={kollectLogo} alt="Kollect logo" className="mx-auto" />
          <h2>Kollect and save your favourite manga's</h2>
        </div>
        <div className="gap-2 grid">
          <Button onClick={openSignInPage}>Sign in</Button>
          <Button onClick={openSignUpPage}>Sign up</Button>
        </div>
      </div>
    </div>
  )
}
