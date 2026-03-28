import type { PlasmoCSConfig } from "plasmo"
import { styles } from "./getStyle"

export const getStyle = () => styles()
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}


const PlasmoOverlay = () => {
  return (
    <div className="fixed top-32 right-8 z-50 bg-white text-black">
      {/* adding text to the screen */}
    </div>
  )
}

export default PlasmoOverlay