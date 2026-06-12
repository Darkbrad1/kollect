import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import Card from "./Card";

import NoMangas from "./NoMangas";
import { useAppState } from "./AppStateProvider";
import { Skeleton } from "./ui/skeleton";
import CardWrapper from "./CardWrapper";
import type { UserMangaPayload } from "~/lib/manga/types";
import appSettings from "~/settings/appSetting";

export default function RenderMangas() {
  const { view, status, search } = useAppState();
  const mangas: UserMangaPayload[] = useQuery(api.manga.listManga);
  console.log(mangas);
  // const mangas = undefined
  if (mangas === undefined) {
    return (
      <CardWrapper>
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`aspect-[1/1.5]`}
          />
        ))}
      </CardWrapper>
    );
  }

  const searchedMangas = mangas.filter((manga) =>
    manga.title.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredMangas = mangas.filter((manga) => manga.status === status);

  const inputMangas = !search ? filteredMangas : searchedMangas;

  return (
    <>
      <NoMangas mangas={inputMangas} />
      <CardWrapper>
        {inputMangas.map((manga) => (
          <Card key={manga.id} manga={manga} />
        ))}
      </CardWrapper>
    </>
  );
}
