// src/components/SidebarFormFields.tsx
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import {
    SidebarGroup,
    SidebarGroupContent,
} from "~/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Input } from "~/components/ui/input";
import {
    allowedStatuses,
    isStatus,
    type Status,
} from "~/hooks/useMangaEdit";
import type { UserMangaPayload } from "~/lib/manga/types";

interface Props {
    data: UserMangaPayload;
    status: Status;
    setStatus: (s: Status) => void;
    selectedTitle: string;
    setSelectedTitle: (t: string) => void;
    selectedSite: string;
    setSelectedSite: (s: string) => void;
    allTitles: string[];
    allSites: string[];
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
            {children}
        </label>
    );
}

export function SidebarFormFields({
    data,
    status,
    setStatus,
    selectedTitle,
    setSelectedTitle,
    selectedSite,
    setSelectedSite,
    allTitles,
    allSites,
}: Props) {
    const scrollPercentage = data?.scroll ?? 0;

    return (
        <>
            {/* Title */}
            <SidebarGroup className="gap-1.5 py-3">
                <FieldLabel>TITLE</FieldLabel>
                <SidebarGroupContent>
                    <Select
                        value={selectedTitle}
                        onValueChange={setSelectedTitle}
                    >
                        <SelectTrigger className="h-12 w-full rounded-full border-none bg-[--clr-surface-a0] !text-white">
                            <SelectValue placeholder="Select a title" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {allTitles.map((title, i) => (
                                    <SelectItem key={i} value={title}>
                                        {title}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Chapter */}
            <SidebarGroup className="gap-1.5 py-3">
                <FieldLabel>CHAPTER</FieldLabel>
                <SidebarGroupContent>
                    <Input
                        name="chapter_number"
                        type="number"
                        defaultValue={data?.currentChapter}
                        key={`chapter-${data?.id}`}
                        className="h-12 rounded-full border-none bg-[--clr-surface-a0] px-5 !text-white"
                    />
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Status */}
            <SidebarGroup className="gap-1.5 py-3">
                <FieldLabel>STATUS</FieldLabel>
                <SidebarGroupContent>
                    <ToggleGroup
                        type="single"
                        value={status}
                        onValueChange={(v) => isStatus(v) && setStatus(v)}
                        className="w-full rounded-full bg-[--clr-surface-a0] p-1"
                    >
                        {allowedStatuses.map((s) => (
                            <ToggleGroupItem
                                key={s}
                                value={s}
                                className="flex-1 rounded-full text-sm capitalize !text-white
                                    hover:!text-[--clr-primary-a0]
                                    data-[state=on]:bg-[--clr-surface-a10]
                                    data-[state=on]:!text-[--clr-primary-a0]"
                            >
                                {s}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Progress */}
            <SidebarGroup className="gap-1.5 py-3">
                <FieldLabel>PROGRESS</FieldLabel>
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
                        step="any"
                        defaultValue={data?.scroll}
                        key={`percentage-${data?.id}`}
                        className="h-12 rounded-full border-none bg-[--clr-surface-a0] px-5 !text-white"
                    />
                </SidebarGroupContent>
            </SidebarGroup>

            {/* Source */}
            <SidebarGroup className="gap-1.5 py-3">
                <FieldLabel>SOURCE</FieldLabel>
                <SidebarGroupContent>
                    <Select
                        value={selectedSite}
                        onValueChange={setSelectedSite}
                    >
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
        </>
    );
}