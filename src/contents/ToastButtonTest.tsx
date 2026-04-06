import type { PlasmoCSConfig } from "plasmo"
import { styles } from "./getStyle"
import { Button } from "~components/ui/button"
import { toast } from "sonner"

export const getStyle = () => styles()
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
const handleClick = () => {
  toast("This is a toast notification!")
}

const PlasmoOverlay = () => {
  return (
  <Button onClick={handleClick} className=" fixed bottom-10 left-10">
    Show Toast
  </Button>
  )
}

export default PlasmoOverlay