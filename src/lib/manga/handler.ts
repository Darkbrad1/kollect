import type { Manga } from "./types";

import { isSameHostname } from "./parser";
import { addManga, DoesMangaExist, updateManga } from "./repository";

// Handle a manual "add manga" action.
//
// If the manga already exists, merge the new information into the existing record.
// Otherwise create a fresh manga entry.
export async function handleAddManga(newData: Manga) {
  const existing = await DoesMangaExist(newData.title);
  // If we already know this manga, merge useful fields instead of duplicating it.
  if (existing) {
    console.log("manga exists")
    await updateManga(existing.id!, {
      // Update the read timestamp to mark this manga as recently accessed.
      lastReadAt: Date.now(),
      // Never reduce recorded progress/chapter when manually adding.
      scroll: Math.max(existing.scroll, newData.scroll),
      currentChapter: Math.max(existing.currentChapter, newData.currentChapter),

      // Use the latest source as the active one.
      domainName: newData.domainName,
      url: newData.url,
    });

    return;
  } else { 
    console.log("manga doen't exists") 
  }

  // Otherwise create a brand-new manga entry.
  return await addManga(newData);
}
export async function handleProgressUpdate() { }
export async function handleChapterUpdate() { }


