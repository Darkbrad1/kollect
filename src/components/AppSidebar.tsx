import { api } from "convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { useState, useEffect } from "react";
import { useAppState } from "./AppStateProvider";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type UpdateMangaData = FunctionArgs<typeof api.manga.updateManga>["data"];

const allowedStatuses = ["reading", "planned", "hiatus", "archived"] as const;
type Status = (typeof allowedStatuses)[number];

function isStatus(value: string): value is Status {
    return (allowedStatuses as readonly string[]).includes(value);
}

function getTrimmedValue(formData: FormData, key: string) {
    return String(formData.get(key) ?? "").trim();
}

export function AppSidebar() {
    const { target } = useAppState();
    const { setOpen } = useSidebar();

    const data = useQuery(
        api.manga.getMangaById,
        target ? { id: target } : "skip"
    );
    const updateManga = useMutation(api.manga.updateManga);

    const CONVEX_SITE_URL = process.env.PLASMO_PUBLIC_CONVEX_SITE_URL;

    const [status, setStatus] = useState<Status>("planned");
    const [selectedTitle, setSelectedTitle] = useState("");
    const [selectedSite, setSelectedSite] = useState("");

    useEffect(() => {
        if (!data) return;
        setStatus(data.status ?? "planned");
        setSelectedTitle(data.display_title);
        setSelectedSite(data.site_url);
    }, [data]);

    if (!target) return null;

    async function onSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!data) return;

        const formData = new FormData(e.currentTarget);
        const updates: UpdateMangaData = {};

        const nextTitle = selectedTitle;
        if (nextTitle !== data.display_title)
            updates.display_title = nextTitle;

        const nextSite = selectedSite;
        if (nextSite !== data.site_url) updates.site_url = nextSite;

        const chapterStr = getTrimmedValue(formData, "chapter_number");
        if (chapterStr !== "") {
            const chapter = Number(chapterStr);
            if (!Number.isNaN(chapter) && chapter !== data.chapter_number)
                updates.chapter_number = chapter;
        }

        const percentageStr = getTrimmedValue(formData, "scroll_percentage");
        if (percentageStr !== "") {
            const percentage = Number(percentageStr);
            if (
                !Number.isNaN(percentage) &&
                percentage !== data.scroll_percentage
            )
                updates.scroll_percentage = percentage;
        }

        if (isStatus(status) && status !== data.status)
            updates.status = status;

        if (Object.keys(updates).length === 0) {
            setOpen(false);
            return;
        }

        await updateManga({ id: data._id, data: updates });
        setOpen(false);
    }

    const coverSrc = data?.cover_url
        ? `${CONVEX_SITE_URL}/mangadex-cover?url=${encodeURIComponent(data.cover_url)}`
        : "";

    const scrollPercentage = data?.scroll_percentage ?? 0;

    const allTitles = data
        ? [...new Set([data.display_title, ...data.alternative_titles])]
        : [];

    const allSites = data
        ? [...new Set([data.site_url, ...data.alternative_sites])]
        : [];

    return (
        <Sidebar side="right" variant="floating">
            <SidebarHeader className="flex flex-row justify-end p-3">
                <SidebarTrigger />
            </SidebarHeader>

            <form onSubmit={onSave} className="contents">
                <SidebarContent className="custom-scroll gap-0 px-4">
                    {/* Cover Image */}
                    <SidebarGroup className="items-center py-4">
                        {coverSrc ? (
                            <img
                                src={coverSrc}
                                alt=""
                                className="w-40 rounded-xl object-cover"
                            />
                        ) : (
                            <div className="h-52 w-40 rounded-xl bg-[--clr-surface-a0]" />
                        )}
                    </SidebarGroup>

                    {/* Title */}
                    <SidebarGroup className="gap-1.5 py-3">
                        <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                            TITLE
                        </label>
                        <SidebarGroupContent>
                            <Select
                                value={selectedTitle}
                                onValueChange={setSelectedTitle}>
                                <SelectTrigger className="h-12 w-full rounded-full border-none bg-[--clr-surface-a0] !text-white">
                                    <SelectValue placeholder="Select a title" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {allTitles.map((t, i) => (
                                            <SelectItem key={i} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Chapter */}
                    <SidebarGroup className="gap-1.5 py-3">
                        <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                            CHAPTER
                        </label>
                        <SidebarGroupContent>
                            <Input
                                name="chapter_number"
                                type="number"
                                defaultValue={data?.chapter_number}
                                key={`chapter-${data?._id}`}
                                className="h-12 rounded-full border-none bg-[--clr-surface-a0] px-5 !text-white"
                            />
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Status */}
                    <SidebarGroup className="gap-1.5 py-3">
                        <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                            STATUS
                        </label>
                        <SidebarGroupContent>
                            <ToggleGroup
                                type="single"
                                value={status}
                                onValueChange={(v) =>
                                    isStatus(v) && setStatus(v)
                                }
                                className="w-full rounded-full bg-[--clr-surface-a0] p-1">
                                {allowedStatuses.map((s) => (
                                    <ToggleGroupItem
                                        key={s}
                                        value={s}
                                        className="flex-1 rounded-full text-sm capitalize !text-white
                                        hover:!text-[--clr-primary-a0]
                                        data-[state=on]:bg-[--clr-surface-a10]
                                        data-[state=on]:!text-[--clr-primary-a0]">
                                        {s}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Progress */}
                    <SidebarGroup className="gap-1.5 py-3">
                        <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                            PROGRESS
                        </label>
                        <SidebarGroupContent className="flex flex-col gap-2">
                            <div className="relative flex h-12 w-full items-center overflow-hidden rounded-full bg-[--clr-surface-a0]">
                                <div
                                    className="absolute left-0 top-0 h-full rounded-full"
                                    style={{
                                        width: `${scrollPercentage}%`,
                                        background:
                                            "linear-gradient(to right, var(--clr-primary-a30), var(--clr-primary-a0))",
                                    }}
                                />
                                <span className="relative ml-auto mr-4 text-sm font-semibold text-white">
                                    {scrollPercentage}%
                                </span>
                            </div>
                            <Input
                                name="scroll_percentage"
                                type="number"
                                min={0}
                                max={100}
                                defaultValue={data?.scroll_percentage}
                                key={`percentage-${data?._id}`}
                                className="h-12 rounded-full border-none bg-[--clr-surface-a0] px-5 !text-white"
                            />
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Source */}
                    <SidebarGroup className="gap-1.5 py-3">
                        <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                            SOURCE
                        </label>
                        <SidebarGroupContent>
                            <Select
                                value={selectedSite}
                                onValueChange={setSelectedSite}>
                                <SelectTrigger className="h-12 w-full rounded-full border-none bg-[--clr-surface-a0] !text-white">
                                    <SelectValue placeholder="Select a source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {allSites.map((site, i) => (
                                            <SelectItem key={i} value={site}>
                                                {site}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Save / Cancel */}
                <SidebarFooter className="flex flex-row gap-3 p-4">
                    <Button
                        type="submit"
                        disabled={!data}
                        className="h-12 flex-1 rounded-full bg-[--clr-surface-a0] text-white hover:bg-[--clr-surface-a30]">
                        Save
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="h-12 flex-1 rounded-full bg-[--clr-surface-a0] text-white hover:bg-[--clr-surface-a30]">
                        Cancel
                    </Button>
                </SidebarFooter>
            </form>
        </Sidebar>
    );
}