import Info from "~components/DetailedViewCardInfo";
import type { Doc } from "convex/_generated/dataModel";
import MangaOptionMenu from "~components/MangaOptionMenu";
import Image from "./DetailedViewCardImage";
// Props type for the DetailedViewCard component
// Expects a single Manga document from Convex
type DataProp = {
    data: Doc<"Manga">;
};

// DetailedViewCard component renders one manga entry in detailed list view
function DetailedViewCard({ data }: DataProp) {
    const CONVEX_SITE_URL = process.env.PLASMO_PUBLIC_CONVEX_SITE_URL
    const coverSrc = data.cover_url ? `${CONVEX_SITE_URL}/mangadex-cover?url=${encodeURIComponent(
        data.cover_url
    )}`: "";
    return (
        // Card container with background, spacing, and rounded corners
        <div className="w-full bg-primary flex gap-2 rounded-lg p-3">
            {/* Manga cover thumbnail Falls back to a placeholder image if cover_url is missing */}
            <Image src={coverSrc}/>
            {/* Component that displays title, progress, and other info */}
            <Info data={data} />
            {/* Action button (e.g., for a menu or more options) */}
            <MangaOptionMenu data={data}/>
        </div>
    );
}
export default DetailedViewCard;
