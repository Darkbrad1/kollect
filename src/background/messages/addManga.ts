import { withAuth } from "~/background/withAuth"
import { handleAddManga } from "~/lib/manga/handler"

// Background message handler for manually adding manga.
//
// The content script only sends { manga }.
// The auth token is resolved here in the background layer
// by the withAuth wrapper.
export default withAuth(async (req, res, token) => {
  const { manga } = req.body

  await handleAddManga(manga, token)

  res.send({ ok: true })
})