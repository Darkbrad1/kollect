import type { Doc } from "convex/_generated/dataModel";
import MangaOptionMenu from '~components/MangaOptionMenu'
import Image from "./CardViewCardImage";
import "~styles/numberthing.css"

// Props type for the CardViewCard component
// Expects a single Manga document from Convex
type DataProp = {
    data: Doc<"Manga">;
};

// CardViewCard component renders a single manga card with a cover image
function CardViewCard({ data }: DataProp) {
    const CONVEX_SITE_URL = process.env.PLASMO_PUBLIC_CONVEX_SITE_URL
    const coverSrc = data.cover_url ? `${CONVEX_SITE_URL}/mangadex-cover?url=${encodeURIComponent(
        data.cover_url
    )}`: "";
    return (

        // Uses CSS Grid to stack elements in the same grid area
        <div>
        {/* Manga cover image
                Falls back to a placeholder image if cover_url is missing */}
            <div className="max-w-40 not-only-of-type:overflow-hidden grid place-items-end [grid-template-areas:'manga'] hover:[&_.options]:visible">
                <Image src={coverSrc} title={data.display_title} />
                <div className=" numberthing rounded-tl-lg [grid-area:manga] p-2 bg-black text-left font-black text-md justify-between items-center">
                    {data.chapter_number}
                </div>
                <MangaOptionMenu data={data}/>
            </div>

            {/* Overlay displaying the current chapter number */}
            <div className="justify-self-start">
                <div className="w-full font-bold mt-2 text-xs line-clamp-2">
                    {data.display_title}
                </div>
                <div className="text-zinc-300 font-medium text-xs">
                    {data.site_name}
                </div>
            </div>
        </div>
    );
}

// Export the component for use in the card grid
export default CardViewCard;
