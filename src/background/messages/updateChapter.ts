import { withAuth } from "~/background/withAuth"
import { handleChapterUpdate } from "~/lib/manga/handler"

// Background message handler for chapter changes detected by the content script.
//
// The content script sends only the scraped manga data.
// This handler resolves auth internally and then applies business logic.
export default withAuth(async (req, res, token) => {
  const { manga } = req.body
  console.log(manga)
  await handleChapterUpdate(manga, token)

  res.send({ ok: true })
})
