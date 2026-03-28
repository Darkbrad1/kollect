import { api } from "convex/_generated/api";
import type { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~components/ui/accordion";
import { Button } from "~components/ui/button";
import { Label } from "~components/ui/label";
import { RadioGroup, RadioGroupItem } from "~components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~components/ui/select";

import {
  EditSheetInput as Input,
  EditSheetTextarea as Textarea,
} from "./EditSheetFormInputs";

// Type for the allowed update payload from your Convex mutation
type UpdateMangaData = FunctionArgs<typeof api.manga.updateManga>["data"];

// Props passed into the form
type FormProps = {
  data: Doc<"Manga">;
  setEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// Allowed manga statuses
const allowedStatuses = [
  "reading",
  "planned",
  "hiatus",
  "archived",
] as const;

type Status = (typeof allowedStatuses)[number];

// Type guard to validate status strings
function isStatus(value: string): value is Status {
  return (allowedStatuses as readonly string[]).includes(value);
}

// Small helper to safely read trimmed string values from FormData
function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export default function EditSheetForm({ data, setEditOpen }: FormProps) {
  // Convex mutation for updating manga
  const updateManga = useMutation(api.manga.updateManga);

  // Convex site URL used to proxy/load the manga cover
  const CONVEX_SITE_URL = process.env.PLASMO_PUBLIC_CONVEX_SITE_URL;

  // Build image source only if a cover exists
  const coverSrc = data.cover_url
    ? `${CONVEX_SITE_URL}/mangadex-cover?url=${encodeURIComponent(
        data.cover_url,
      )}`
    : "";

  // Local UI state for controlled fields
  const [status, setStatus] = useState<Status>(data.status ?? "planned");
  const [altTitle, setAltTitle] = useState<string>(data.display_title);
  const [altSite, setAltSite] = useState<string>(data.site_url);

  // Shared class name for form sections
  const sectionStyles = "w-full rounded-xl bg-zinc-900 p-2";

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Read all form values
    const formData = new FormData(e.currentTarget);

    // Object that will only contain changed fields
    const updates: UpdateMangaData = {};

    // Cover URL
    const coverUrl = getTrimmedValue(formData, "cover_url");
    if (coverUrl !== data.cover_url) {
      updates.cover_url = coverUrl;
    }

    // Title:
    // Prefer selected alternative title, otherwise use textarea value
    const selectedTitle = getTrimmedValue(formData, "display_title_radio");
    const typedTitle = getTrimmedValue(formData, "display_title");
    const nextTitle = selectedTitle || typedTitle;

    if (nextTitle !== data.display_title) {
      updates.display_title = nextTitle;
    }

    // Site name:
    // Prefer selected radio value if present, otherwise use textarea value
    const selectedSiteName = getTrimmedValue(formData, "site_name_radio");
    const typedSiteName = getTrimmedValue(formData, "site_name");
    const nextSiteName = selectedSiteName || typedSiteName;

    if (nextSiteName !== data.site_name) {
      updates.site_name = nextSiteName;
    }

    // Site URL from alternative sites selection
    const nextSiteUrl = getTrimmedValue(formData, "site_url_radio");
    if (nextSiteUrl && nextSiteUrl !== data.site_url) {
      updates.site_url = nextSiteUrl;
    }

    // Chapter number
    const chapterStr = getTrimmedValue(formData, "chapter_number");
    if (chapterStr !== "") {
      const chapter = Number(chapterStr);

      if (!Number.isNaN(chapter) && chapter !== data.chapter_number) {
        updates.chapter_number = chapter;
      }
    }

    // Scroll percentage
    const percentageStr = getTrimmedValue(formData, "scroll_percentage");
    if (percentageStr !== "") {
      const percentage = Number(percentageStr);

      if (
        !Number.isNaN(percentage) &&
        percentage !== data.scroll_percentage
      ) {
        updates.scroll_percentage = percentage;
      }
    }

    // Status
    const statusValue = getTrimmedValue(formData, "status");
    if (isStatus(statusValue) && statusValue !== data.status) {
      updates.status = statusValue;
    }

    // If nothing changed, just close the sheet
    if (Object.keys(updates).length === 0) {
      setEditOpen(false);
      return;
    }

    // Send update to Convex
    // Do not pass user_id here — backend auth handles that
    await updateManga({
      id: data._id,
      data: updates,
    });

    // Close form after save
    setEditOpen(false);
  }

  return (
    <form onSubmit={onSave} className="mt-5 grid gap-2">
      {/* Cover image and editable cover URL */}
      <div className={sectionStyles}>
        <div className="overflow-hidden rounded-xl border-4">
          <img src={coverSrc} alt="" />
        </div>

        <Textarea
          id="cover-url"
          title="Cover Url"
          name="cover_url"
          defaultValue={data.cover_url}
        />
      </div>

      {/* Main text fields */}
      <div className={sectionStyles}>
        <Textarea
          id="title"
          title="Title"
          name="display_title"
          defaultValue={data.display_title}
        />

        <Textarea
          id="site-name"
          title="Site name"
          name="site_name"
          defaultValue={data.site_name}
        />
      </div>

      {/* Numeric fields and status select */}
      <div className={sectionStyles}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            id="chapter"
            title="Chapter"
            name="chapter_number"
            type="number"
            defaultValue={data.chapter_number}
          />

          <div>
            <label htmlFor="status" className="p-2">
              Status
            </label>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as Status)}>
              <SelectTrigger
                id="status"
                className="mt-1.5 w-full border-none bg-black">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="reading">reading</SelectItem>
                  <SelectItem value="planned">planned</SelectItem>
                  <SelectItem value="hiatus">hiatus</SelectItem>
                  <SelectItem value="archived">archived</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Hidden input so FormData can read the selected status */}
            <input type="hidden" name="status" value={status} />
          </div>

          <Input
            id="percentage"
            title="Percentage"
            name="scroll_percentage"
            type="number"
            min={0}
            max={100}
            defaultValue={data.scroll_percentage}
          />
        </div>

        {/* Expandable sections for alternative titles and sites */}
        <Accordion type="single" collapsible>
          <AccordionItem value="alternative-titles">
            <AccordionTrigger>Alternative titles</AccordionTrigger>

            <AccordionContent>
              <RadioGroup value={altTitle} onValueChange={setAltTitle}>
                {data.alternative_titles.map((titleItem, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={titleItem}
                      id={`alt-title-${index}`}
                      title={titleItem}
                    />
                    <Label htmlFor={`alt-title-${index}`}>
                      {titleItem}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Hidden input so the selected alternative title is included in FormData */}
              <input
                type="hidden"
                name="display_title_radio"
                value={altTitle}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="alternative-sites">
            <AccordionTrigger>Alternative sites</AccordionTrigger>

            <AccordionContent>
              <RadioGroup value={altSite} onValueChange={setAltSite}>
                {data.alternative_sites.map((siteItem, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={siteItem}
                      id={`alt-site-${index}`}
                    />
                    <Label htmlFor={`alt-site-${index}`}>{siteItem}</Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Hidden input so the selected site URL is included in FormData */}
              <input type="hidden" name="site_url_radio" value={altSite} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Sticky action buttons */}
      <div className="sticky bottom-0 z-50 flex justify-end gap-1 bg-background p-3">
        <Button type="submit">Save</Button>

        <Button type="button" onClick={() => setEditOpen(false)}>
          Close
        </Button>
      </div>
    </form>
  );
}