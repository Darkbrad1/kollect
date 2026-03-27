import { Sheet, SheetContent } from "~components/ui/sheet";
import type { Doc } from "convex/_generated/dataModel";
import EditSheetForm from "./EditSheetForm";

type EditSheetProps = {
    data: Doc<"Manga">;
    editOpen: boolean;
    setEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function MangaOptionMenuEditSheet({
    editOpen,
    setEditOpen,
    data,
}: EditSheetProps) {
    return (
        <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetContent
                side="right"
                className="
                w-dvw
                p-3 pb-0
                overflow-y-auto
                sm:w-full sm:max-w-md
                ">
                <EditSheetForm
                    key={data._id}
                    data={data}
                    setEditOpen={setEditOpen}
                />
            </SheetContent>
        </Sheet>
    );
}
