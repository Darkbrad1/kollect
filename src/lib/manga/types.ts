import type { Id } from "convex/_generated/dataModel"

export type MangaStatus =
  | "reading"
  | "planned"
  | "hiatus"
  | "archived"

export type Manga = {
    title: string,
    currentChapter: number,
    lastReadAt: number,
    scroll: number,
    status: MangaStatus,
  domainName: string,
    siteLogo: string,
    site: string,
}

export type UserMangaPayload = {
  id: Id<"userMangas">;
  MangaDexId: string;
  coverImage: string | null;
  title: string;
  altTitles: string[];
  currentChapter: number;
  lastReadAt: Date | null;
  status: MangaStatus;
  scroll: number;
  DomainName: string;
  site: string;
  altSite: string[];
  siteLogo: string;
};
