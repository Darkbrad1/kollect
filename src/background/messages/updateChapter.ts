import type { PlasmoMessaging } from "@plasmohq/messaging"

import { handleChapterUpdate } from "../../lib/manga/handler"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { manga, token } = req.body

  if (!token) {
    res.send({ ok: false, error: "Missing auth token" })
    return
  }

  await handleChapterUpdate(manga, token)
  res.send({ ok: true })
}

export default handler