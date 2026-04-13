import { api } from "convex/_generated/api"; // Generated Convex API references
import { useQuery } from "convex/react"; // Convex hook for running queries
import Card from "./NewCard";

import CardView from "~/components/CardView"; // Component for card-style manga display
import DetailedView from "~/components/DetailedView"; // Component for detailed manga display

import { useAppState } from "./AppStateProvider"; // Custom hook to access shared app state

export default function RenderMangas() {
    // Get the current UI state from context
    const { view, status, search } = useAppState();

    // Fetch manga data from Convex using the listManga query
    // This will be undefined at first while the query is loading
    const mangas = useQuery(api.manga.listManga);

    // Show a loading message until the query returns data
    if (mangas === undefined) {
        return <div>Loading...</div>;
    }

    // Filter manga by title when the user types in the search box
    // Convert both strings to lowercase so the search is case-insensitive
    const searchedMangas = mangas.filter((manga) =>
        manga.display_title.toLowerCase().includes(search.toLowerCase()),
    );

    // Filter manga by the currently selected status/status
    const filteredMangas = mangas.filter((manga) => manga.status === status);

    // Choose which list to show:
    // - if there is no search text, show manga filtered by status/status
    // - otherwise, show manga filtered by search text
    const inputMangas = !search ? filteredMangas : searchedMangas;

    // Decide which component to render based on the selected view
    // function renderView() {
    //   switch (view) {
    //     case "Card":
    //       // Render manga in card format
    //       return <CardView data={inputMangas} />

    //     case "Detailed":
    //       // Render manga in detailed list format
    //       return <DetailedView data={inputMangas} />

    //     default:
    //       // Fallback in case view has an unexpected value
    //       return null
    //   }
    // }

    // Render whichever view was selected
    return (
        <div className="w-full h-full flex flex-wrap gap-3 mx-auto">
            {inputMangas.map((data) => (
                // Use the document ID as the React key for stable rendering
                <Card key={data._id} url={data.site_url} id={data._id} image={data.cover_url} chapter={`${data.chapter_number}`} title={data.display_title}/>
            ))}
        </div>
    );
}
