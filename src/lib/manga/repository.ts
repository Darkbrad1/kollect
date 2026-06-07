import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { createAuthedConvexClient } from "~/lib/convexHttp";


import type { Manga } from "./types";
async function getConvex() {
  const { clerk_token } = await chrome.storage.local.get("clerk_token");
  if (!clerk_token) throw new Error("No auth token found");
  return createAuthedConvexClient(clerk_token);
}

// Find if a manga already exists =================================================================================================

// Fetch all mangas for the authenticated user from Convex.
export async function fetchMangas() {
  const convex = await getConvex();
  console.log("fetching Manga Exist ...")
  return await convex.query(api.manga.listManga);
}

export async function DoesMangaExist(title: string) {
  const convex = await getConvex();
  console.log("checking does Manga Exist ...")
  return await convex.query(api.manga.findUserMangaByTitle, { title });
}

export async function updateManga(id: Id<"userMangas">, data: Partial<Manga>) {
  const convex = await getConvex();
  console.log("Running Updating Manga ...")
  return await convex.mutation(api.manga.updateManga, { id, data });
}

export async function addManga(data: Partial<Manga>) {
  const convex = await getConvex();
  console.log("Running Add Manga ...")
  return await convex.action(api.manga.createManga, data)

};
