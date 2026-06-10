// src/components/AppSidebar.tsx
import { Button } from "~/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarTrigger,
    useSidebar,
} from "~/components/ui/sidebar";
import { useAppState } from "./AppStateProvider";
import { SidebarCoverImage } from "./SidebarCoverImage";
import { SidebarFormFields } from "./SidebarFormFields";
import { useMangaEdit } from "~/hooks/useMangaEdit";

export function AppSidebar() {
    const { target } = useAppState();
    const { setOpen } = useSidebar();

    const {
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
    } = useMangaEdit(target);

    if (!target) return null;

    return (
        <Sidebar side="right" variant="floating">
            <SidebarHeader className="flex flex-row justify-end p-3">
                <SidebarTrigger />
            </SidebarHeader>

            <form onSubmit={onSave} className="contents">
                <SidebarContent className="custom-scroll gap-0 px-1 ">
                    <SidebarGroup className="items-center ">
                        <SidebarCoverImage
                            coverImage={data?.coverImage}
                        />
                    </SidebarGroup>

                    {data && (
                        <SidebarFormFields
                            data={data}
                            status={status}
                            setStatus={setStatus}
                            selectedTitle={selectedTitle}
                            setSelectedTitle={setSelectedTitle}
                            selectedSite={selectedSite}
                            setSelectedSite={setSelectedSite}
                            allTitles={allTitles}
                            allSites={allSites}
                        />
                    )}
                </SidebarContent>

                <SidebarFooter className="flex flex-row gap-3 p-4">
                    <Button
                        type="submit"
                        disabled={!data}
                        className="h-12 flex-1 rounded-full bg-[--clr-surface-a0] text-white hover:bg-[--clr-surface-a30]"
                    >
                        Save
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="h-12 flex-1 rounded-full bg-[--clr-surface-a0] text-white hover:bg-[--clr-surface-a30]"
                    >
                        Cancel
                    </Button>
                </SidebarFooter>
            </form>
        </Sidebar>
    );
}