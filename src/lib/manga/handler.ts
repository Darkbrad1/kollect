import type { Manga } from "./types";
import appSettings from "../../settings/appSetting";

import { addManga, DoesMangaExist, updateManga } from "./repository";

function sendResponse(ok: boolean, log?: string[] | string, message?: string, ) { 
  console.log(log)
  return {
    message: message,
    ok: ok
  }
}

// Handle a manual "add existingData" action.
//
// If the existingData already exists, merge the new information into the existing record.
// Otherwise create a fresh existingData entry.
export async function handleAddManga(manga: Manga) {
  console.log("Add Manga handler triggered",manga)
  const existing = await DoesMangaExist(manga.title);
  // If we already know this manga, merge useful fields instead of duplicating it.
  if (existing) {
    console.log("manga exists");
    await updateManga(existing.id!, {
      // Update the read timestamp to mark this manga as recently accessed.
      lastReadAt: Date.now(),
      // Never reduce recorded progress/chapter when manually adding.
      scroll: Math.max(existing.scroll, manga.scroll),
      currentChapter: Math.max(existing.currentChapter, manga.currentChapter),

      // Use the latest source as the active one.
      domainName: manga.domainName,
      site: manga.site,
    });

    return;
  } else {
    console.log("manga doen't exists");
  }

  // Otherwise create a brand-new manga entry.
  return await addManga(manga);
}
// Handle scroll/progress updates from the reader page.
 export async function handleProgressUpdate(newData: Manga) {
  console.log("update progress handler triggered", newData)
  
  const existingData = await DoesMangaExist(newData.title);
  // If no matching existingData exists, there is nothing to update.
  if (!existingData)  {
    console.log("No manga found")
    return false
  }

  // Only update progress if we are still on the same chapter.
  if (newData.currentChapter !== existingData.currentChapter) return console.log(`${newData.currentChapter} is not the same as ${existingData.currentChapter}`);

  // Never overwrite with a lower scroll value.
  if (newData.scroll < existingData.scroll) return console.log("lower scroll percentage");

  

  await updateManga(
      existingData.id,
      {
        scroll: newData.scroll,
        lastReadAt: Date.now(),
      },
    );
    return existingData.id
}


export async function handleChapterUpdate(newData: Manga) {
  console.log("update chapter handler triggered", newData)
  
  const existingData = await DoesMangaExist(newData.title);
  const chapterDelta = newData.currentChapter - existingData.currentChapter;
  const chapterIncreased = chapterDelta > appSettings.scrollThreshold;
  const scrollPassedThreshold = existingData.scroll > 0 || chapterDelta > 1;
  
  if (!existingData) return sendResponse(false, ["manga does not exist -", newData.title])
  if (!chapterIncreased) return sendResponse(false, "chapter didn't increase")
  if (!scrollPassedThreshold) return sendResponse(true, "Didn't reach the threshold for the manga to update", `skipped Chapter ${existingData.currentChapter}`)

  await updateManga(existingData.id!, {
    title: newData.title,
    currentChapter: newData.currentChapter,
    lastReadAt: Date.now(),
    scroll: newData.scroll,
    domainName: newData.domainName,
    site: newData.site,
  });
  return sendResponse(true, "chapter updated", `upated ${newData.title} to chapter ${newData.currentChapter}`)
}
