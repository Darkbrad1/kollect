// src/hooks/useMangaEdit.ts
import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { useEffect, useState } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import type { UserMangaPayload } from "~/lib/manga/types";

export type UpdateMangaData =
    FunctionArgs<typeof api.manga.updateManga>["data"];

const allowedStatuses = [
    "reading",
    "planned",
    "hiatus",
    "archived",
] as const;
export type Status = (typeof allowedStatuses)[number];
export { allowedStatuses };

export function isStatus(value: string): value is Status {
    return (allowedStatuses as readonly string[]).includes(value);
}

function getTrimmedValue(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

export function useMangaEdit(target: string | null) {
    const { setOpen } = useSidebar();

    const data: UserMangaPayload = useQuery(
        api.manga.getManga,
        target ? { id: target } : "skip",
    );
    const updateManga = useMutation(api.manga.updateManga);

    const [status, setStatus] = useState<Status>("planned");
    const [selectedTitle, setSelectedTitle] = useState("");
    const [selectedSite, setSelectedSite] = useState("");

    useEffect(() => {
        if (!data) return;
        setStatus(data.status ?? "planned");
        setSelectedTitle(data.title);
        setSelectedSite(data.site);
    }, [data]);

    async function onSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!data) return;

        const formData = new FormData(e.currentTarget);
        const updates: UpdateMangaData = {};

        if (selectedTitle !== data.title)
            updates.display_title = selectedTitle;

        if (selectedSite !== data.site) updates.site_url = selectedSite;

        const chapterStr = getTrimmedValue(formData, "chapter_number");
        if (chapterStr !== "") {
            const chapter = Number(chapterStr);
            if (
                !Number.isNaN(chapter) &&
                chapter !== data.currentChapter
            )
                updates.chapter_number = chapter;
        }

        const percentageStr = getTrimmedValue(
            formData,
            "scroll_percentage",
        );
        if (percentageStr !== "") {
            const percentage = Number(percentageStr);
            if (
                !Number.isNaN(percentage) &&
                percentage !== data.scroll
            )
                updates.scroll = percentage;
        }

        if (isStatus(status) && status !== data.status)
            updates.status = status;

        if (Object.keys(updates).length === 0) {
            setOpen(false);
            return;
        }

        await updateManga({ id: data.id, data: updates });
        setOpen(false);
    }

    const allTitles = data
        ? [...new Set([data.title, ...(data.altTitles ?? [])])]
        : [];

    const allSites = data
        ? [...new Set([data.site, ...(data.altSite ?? [])])]
        : [];

    return {
        data,
        status,
        setStatus,
        selectedTitle,
        setSelectedTitle,
        selectedSite,
        setSelectedSite,
        allTitles,
        allSites,
        onSave,
    };
}