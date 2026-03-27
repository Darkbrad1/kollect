import Card from "./CardViewCard";
import type { Doc } from "convex/_generated/dataModel";

// Props type for the CardView component
// Expects an array of Manga documents from Convex
type DataProp = {
    data: Doc<"Manga">[];
};

// CardView component renders a responsive grid of Card components
function CardView({ data }: DataProp) {
    return (
        // Main container using CSS Grid for a responsive card layout
        <main
            className="grid gap-2 gap-y-4 row px-3
            grid-cols-[repeat(auto-fit,minmax(min(100%,115px),1fr))]
            [&:not(:has(>_:nth-child(6)))]:grid-cols-[repeat(9,minmax(min(100%,100px),1fr))]"
        >
            {/* Loop through manga data and render a Card for each item */}
            {data.map((data) => (
                // Use the document ID as the React key for stable rendering
                <Card key={data._id} data={data} />

            ))}
        </main>
    );
}
export default CardView;