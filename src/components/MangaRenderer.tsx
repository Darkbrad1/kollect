import { useUser } from "@clerk/clerk-react"
import { useQuery } from "convex/react"

import CardView from "~/components/CardView"
import DetailedView from "~/components/DetailedView"

import { api } from "../../convex/_generated/api"
import { useAppState } from "./AppStateProvider"

export default function MangaRenderer() {
  // Read the current view type, active page, and search query from app state
  const { view, page, search } = useAppState()
  const { user, isLoaded } = useUser()
  // Fetch the list of manga from Convex
  const mangas = useQuery(
    api.manga.listManga,
    user ? { user_id: user.id } : "skip"
  )
  // Decides which view to render and which data to pass into it
  // While the query is still loading, show a placeholder
  if (!isLoaded || mangas === undefined) return <div>Loading...</div>
  // Filter manga based on the search input (title match)
  const searchedMangas = mangas.filter((manga) =>
    manga.display_title.toLowerCase().includes(search)
  )
  // Filter manga based on the selected page/status
  const filteredMangas = mangas.filter((manga) => manga.status == page)
  // Decide which dataset to use:
  // if no search is active, use page-filtered results
  // otherwise, use search-filtered results
  const inputMangas = !search ? filteredMangas : searchedMangas
  console.log(inputMangas)
  function renderView() {
    let displayView
    // Switch between different layout views
    switch (view) {
      case "Card":
        displayView = <CardView data={inputMangas} />
        break
      case "Detailed":
        displayView = <DetailedView data={inputMangas} />
        break
    }
    // Return the selected view component
    return displayView
  }

  // Render the chosen view
  return <>{renderView()}</>
}
