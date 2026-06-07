import { toast } from "sonner"

import { sendToBackground } from "@plasmohq/messaging"

import { buildMangaDataFromDocument } from "~/lib/manga/scraper"

import { contentState } from "../state"
import { getScrollPercentage } from "./scroll"



/**
 * Send a manual "add manga" request.
 *
 * This is usually triggered from the background script, for example
 * by a context menu action.
 */
export async function sendAddManga() {
  const manga = buildMangaDataFromDocument(location.href, getScrollPercentage())
  console.log('step 2 -', manga)
  // console.log(manga)
  const result = await sendToBackground({
    name: "addManga",
    body: { manga }
  })
  if (!result) {
    toast.error(`Something went wrong while adding ${manga.title}`, {
      description: "check if the manga is already added"
    })
  } else {
    toast.success(`${manga.title} was added successfully`)
  }
}