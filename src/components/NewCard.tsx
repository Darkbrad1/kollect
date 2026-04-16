import "~/styles/Custom.css";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark02Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Button } from "./ui/button";
import OptionMenu from "~/components/MangaOptionMenu";
import type { Id } from "convex/_generated/dataModel";
import { useAppState } from "./AppStateProvider";
interface CardProps {
    id?: Id<"Manga">;
    image?: string;
    chapter?: string;
    title?: string;
    url?: string;
}
function Image({ src }: { src?: string }) {
    return src ? (
        <img className="object-cover h-full" src={src} alt="Cover Image" />
    ) : (
        <div className="grid place-content-center">
            <svg
                className="w-8 h-[45px] text-white/50"
                viewBox="0 0 34 45"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    fill="currentColor"
                    d="M3.8964 0.200562C2.08645 0.200562 0.620483 1.7358 0.620483 3.63125V41.3689C0.620483 43.2643 2.08645 44.7995 3.8964 44.7995H30.1037C31.9136 44.7995 33.3796 43.2643 33.3796 41.3689V13.0657C33.3796 12.6111 33.2077 12.1753 32.8997 11.8528L22.253 0.703104C21.9451 0.380619 21.529 0.200562 21.0949 0.200562H3.8964ZM20.276 3.46709L30.2604 13.9233H21.9139C21.0098 13.9233 20.276 13.1549 20.276 12.208V3.46709ZM8.81026 13.9233C10.6202 13.9233 12.0862 15.4586 12.0862 17.354C12.0862 19.2495 10.6202 20.7847 8.81026 20.7847C7.00032 20.7847 5.53435 19.2495 5.53435 17.354C5.53435 15.4586 7.00032 13.9233 8.81026 13.9233ZM12.0862 27.6494C13.1005 27.6494 14.1147 28.0551 14.8886 28.8656L17 31.0768L17.0256 31.05L18.9419 33.0602C19.6331 33.784 20.7492 33.7773 21.4404 33.0534C22.1317 32.3296 22.1317 31.1524 21.4404 30.4268L19.5721 28.4703C21.1232 27.2725 23.3121 27.395 24.7164 28.8656L28.4657 32.7921V37.9382H5.53435V32.7921L9.28373 28.8656C10.0577 28.0551 11.0719 27.6494 12.0862 27.6494Z"
                />
            </svg>
        </div>
    );
}
export default function Card({ id, image, chapter, title, url}: CardProps) {

    console.log(id);
    return (
        <a
            href={url}
            target="_blank"
            className="bg-zinc-600 aspect-[1/1.5] h-[211px] rounded-lg overflow-hidden card-style shadow-md shadow-black/50 hover:scale-105">
            <Image src={image} />
            <div className="overlay p-3 flex flex-col justify-between ">
                <div className="flex justify-between">
                    <span className="px-2 py-1 rounded-full flex items-center gap-1 font-bold">
                        <HugeiconsIcon
                            icon={Bookmark02Icon}
                            size={13}
                            fill="white"
                            color="currentColor"
                            strokeWidth={1.5}
                        />
                        {chapter}
                    </span>
                    <OptionMenu id={id}/>
                </div>
                <p className="font-black line-clamp-2">{title}</p>
            </div>
        </a>
    );
}
