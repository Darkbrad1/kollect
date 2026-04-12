import { withAuth } from "~/background/withAuth"
import { handleProgressUpdate } from "~/lib/manga/handler"

// Background message handler for reading progress updates.
//
// The content script sends scraped manga data and current scroll percentage.
// The auth token is looked up in the background and passed into the handler.
export default withAuth(async (req, res, token) => {
  const { manga } = req.body

  await handleProgressUpdate(manga, token)

  res.send({ ok: true })
})
