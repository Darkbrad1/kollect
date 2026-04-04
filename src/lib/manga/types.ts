import type { Id } from "convex/_generated/dataModel"

export type MangaStatus =
  | "reading"
  | "planned"
  | "hiatus"
  | "archived"

export type Manga = {
  _id?: Id<"Manga">
  display_title: string
  cover_url: string
  alternative_titles: string[]
  chapter_number: number
  last_read_timeStamp: number
  scroll_percentage: number
  status: MangaStatus
  site_name: string
  site_url: string
  alternative_sites: string[]
  mangadex_id: string
}

export type PartialManga = {
  display_title?: string
  cover_url?: string
  alternative_titles?: string[]
  chapter_number?: number
  last_read_timeStamp?: number
  scroll_percentage?: number
  status?: MangaStatus
  site_name?: string
  site_url?: string
  alternative_sites?: string[]
  mangadex_id?: string
}


export type MangaDexManga = {
  id: string;
  title: string;
  alternative_titles: string[];
  cover_url: string | null;
};