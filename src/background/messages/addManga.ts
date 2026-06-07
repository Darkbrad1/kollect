import type { PlasmoMessaging } from "@plasmohq/messaging"
import { handleAddManga } from "~/lib/manga/handler"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { manga } = req.body
  console.log('step 3 -', manga)
  const result = await handleAddManga(manga)
  if (result) { 
    console.log("manga added successfully")
  }
  res.send({ ok: true })
}

export default handler