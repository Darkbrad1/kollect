import type { PlasmoCSConfig } from "plasmo"
import { Toaster } from "~/components/ui/sonner"
import { styles } from "./getStyle"

export const getStyle = () => styles()
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const PlasmoOverlay = () => {
  return <Toaster position="bottom-right" duration={1500} />
}

export default PlasmoOverlay
