// src/components/SidebarCoverImage.tsx
const CONVEX_SITE_URL = process.env.PLASMO_PUBLIC_CONVEX_SITE_URL;

interface Props {
    coverImage?: string | null;
}

export function SidebarCoverImage({ coverImage }: Props) {
    const src = coverImage
        ? `${CONVEX_SITE_URL}/mangadex-cover?url=${encodeURIComponent(coverImage)}`
        : null;

    return src ? (
        <img
            src={src}
            alt=""
            className="w-40 rounded-xl object-cover"
        />
    ) : (
        <div className="h-52 w-40 rounded-xl bg-[--clr-surface-a0]" />
    );
}