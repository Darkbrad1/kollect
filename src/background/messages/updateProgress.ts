import type { PlasmoMessaging } from "@plasmohq/messaging"
import { handleProgressUpdate } from "~/lib/manga/handler"

// Background message handler for reading progress updates.
//
// The content script sends scraped manga data and current scroll percentage.
// The auth token is looked up in the background and passed into the handler.
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { manga } = req.body
  const result = await handleProgressUpdate(manga)
  console.log("result", result);
  if (!result) {
    console.log("progress update failed")
    return 
  }
  res.send(true)
}

export default handler