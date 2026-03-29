import type { PlasmoMessaging } from "@plasmohq/messaging"

import { handleAddManga } from "../../lib/manga/handler"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { manga, token } = req.body

  if (!token) {
    res.send({ ok: false, error: "Missing auth token" })
    return
  }

  await handleAddManga(manga, token)
  res.send({ ok: true })
}

export default handler