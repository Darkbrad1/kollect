import Card from "~components/DetailedViewCard";
import type { Doc } from "convex/_generated/dataModel";

// Props type for the DetailedView component
// Expects an array of Manga documents from Convex
type DataProp = {
    data: Doc<"Manga">[];
};

// DetailedView component renders a vertical list of detailed manga cards
function DetailedView({ data }: DataProp) {
    return (
        // Main container using a column flex layout with spacing
        <main className="w-full px-3 flex flex-col gap-2">
            {/* Render a DetailedViewCard for each manga item */}
            {data.map((data) => (
                // Use the document ID as the React key for efficient rendering
                <Card key={data._id} data={data} />
            ))}
        </main>
    );
}
export default DetailedView;