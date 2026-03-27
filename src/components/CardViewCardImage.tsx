import { Image as LucideImage } from "lucide-react";
export default function Image({ src, title}: { src?: string; title?: string  }) {
    const grid = "[grid-area:manga] rounded-xl"
    if (!src) {
        return (
        <div className={`${grid} bg-zinc-800 w-full aspect-3/4 p-2 overflow-hidden grid place-items-center`}>{
            <LucideImage />
        }</div>
    );
    }
    return (
        <img
            className={`${grid} w-full h-full object-cover`}
            src={src}
            alt={title}
        />
    );
}
