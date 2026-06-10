import type { PlasmoCSConfig } from "plasmo"

import { Progress } from "~/components/ui/progress"

import { styles } from "./getStyle"

export const getStyle = () => styles()
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const PlasmoOverlay = () => {
  return (
    <div className="fixed top-32 right-8 z-50 bg-white text-black">
      <Progress value={50} />
    </div>
  )
}

export default PlasmoOverlay