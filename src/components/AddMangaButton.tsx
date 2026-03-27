import { api } from "convex/_generated/api";
import { useAction, useMutation } from "convex/react";

import { Button } from "~components/ui/button";

function AddMangaButton() {
  // Action: search MangaDex by title
  const searchManga = useAction(api.mangadex.searchMangaByTitle);

  // Mutation: save manga to Convex
  const createManga = useMutation(api.manga.createManga);

  async function handleAdd() {
    const results = await searchManga({
      title: "eternally regressing knight",
    });

    if (!results.length) return;

    const manga = results[0];

    await createManga({
      display_title: manga.title,
      cover_url: manga.cover_url,
      alternative_titles: manga.alternative_titles,
      chapter_number: 10,
      last_read_timeStamp: Date.now(),
      scroll_percentage: 90,
      status: "reading",
      site_name: "MangaDex",
      site_url: "https://mangadex.org",
      alternative_sites: [],
      mangadex_id: manga.id,
    });
  }

  return (
    <Button className="m-3 p-6" onClick={handleAdd}>
      click to add manga
    </Button>
  );
}

export default AddMangaButton;