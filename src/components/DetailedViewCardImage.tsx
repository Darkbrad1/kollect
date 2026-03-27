import { Image as LucideImage } from "lucide-react";

export default function Image({ src }: { src: string }) {
    const dimensions = "h-22.5 aspect-2/3 rounded-sm";

    if (!src) {
        return (
            <div
                className={`${dimensions} bg-zinc-700 grid place-items-center`}>
                <LucideImage className="h-6 w-6 text-zinc-300" />
            </div>
        );
    }

    return (
        <img
            className={`${dimensions} block  object-cover`}
            src={src}
            alt="Manga cover"
        />
    );
}
