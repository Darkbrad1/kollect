import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Id } from "convex/_generated/dataModel";

import { handleChapterUpdate } from "~/lib/manga/handler";

// Background message handler for chapter changes detected by the content script.
//
// The content script sends only the scraped manga data.
// This handler resolves auth internally and then applies business logic.
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { manga } = req.body;
  const result = await handleChapterUpdate(manga);
  if (result) {
    console.log("Chapter updated successfully");
  }

  res.send({ ok: true });
};

export default handler;
