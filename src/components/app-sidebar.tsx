import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
} from "~/components/ui/sidebar";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Progress } from "~/components/ui/progress";
import { SidebarTrigger } from "~/components/ui/sidebar";

export function AppSidebar() {
    return (
        <Sidebar side="right" variant="floating">
            <SidebarHeader className="flex flex-row justify-end p-3">
                <SidebarTrigger />
            </SidebarHeader>

            <SidebarContent className="px-4 gap-0 custom-scroll">
                {/* Cover Image */}
                <SidebarGroup className="items-center py-4">
                    <div className="w-40 h-52 rounded-xl bg-[--clr-surface-a0]" />
                </SidebarGroup>

                {/* Title */}
                <SidebarGroup className="gap-1.5 py-3">
                    <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                        TITLE
                    </label>
                    <SidebarGroupContent>
                        <Select>
                            <SelectTrigger className="w-full rounded-full bg-[--clr-surface-a0] border-none h-12 !text-white">
                                <SelectValue placeholder="The name of the manga goes here" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="title1">
                                        The name of the manga goes here
                                    </SelectItem>
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
                            defaultValue="358"
                            className="rounded-full bg-[--clr-surface-a0] border-none h-12 px-5 !text-white"
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
                            defaultValue="reading"
                            className="w-full rounded-full bg-[--clr-surface-a0] p-1">
                            {["reading", "library", "hiatus", "archived"].map(
                                (s) => (
                                    <ToggleGroupItem
                                        key={s}
                                        value={s}
                                        className="flex-1 rounded-full text-sm capitalize !text-white
                                                hover:!text-[--clr-primary-a0]
                                                data-[state=on]:bg-[--clr-surface-a10]
                                                data-[state=on]:!text-[--clr-primary-a0]">
                                        {s}
                                    </ToggleGroupItem>
                                ),
                            )}
                        </ToggleGroup>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Progress */}
                <SidebarGroup className="gap-1.5 py-3">
                    <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                        PROGRESS
                    </label>
                    <SidebarGroupContent>
                        <div className="relative w-full h-12 rounded-full bg-[--clr-surface-a0] overflow-hidden flex items-center">
                            <div
                                className="absolute left-0 top-0 h-full rounded-full"
                                style={{
                                    width: "50%",
                                    background:
                                        "linear-gradient(to right, var(--clr-primary-a30), var(--clr-primary-a0))",
                                }}
                            />
                            <span className="relative ml-auto mr-4 text-sm font-semibold text-white">
                                50%
                            </span>
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Source */}
                <SidebarGroup className="gap-1.5 py-3">
                    <label className="text-xs font-bold tracking-widest text-[--text-clr-2]">
                        SOURCE
                    </label>
                    <SidebarGroupContent>
                        <Select>
                            <SelectTrigger className="w-full rounded-full bg-[--clr-surface-a0] border-none h-12 !text-white">
                                <SelectValue placeholder="Asurascans" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="asurascans">
                                        Asurascans
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Save / Cancel */}
            <SidebarFooter className="flex flex-row gap-3 p-4">
                <Button className="flex-1 rounded-full bg-[--clr-surface-a0] hover:bg-[--clr-surface-a30] text-white h-12">
                    Save
                </Button>
                <Button
                    variant="ghost"
                    className="flex-1 rounded-full bg-[--clr-surface-a0] hover:bg-[--clr-surface-a30] text-white h-12">
                    cancel
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
