import type { PlasmoCSConfig } from "plasmo"
import { styles } from "./getStyle"
import { Toaster } from "~components/ui/sonner"

export const getStyle = () => styles()
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}


const PlasmoOverlay = () => {
  return (
    <Toaster position="bottom-right" />
  )
}

export default PlasmoOverlay