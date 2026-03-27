// import { useUser } from "@clerk/clerk-react"
import { api } from "convex/_generated/api"
import type { Doc } from "convex/_generated/dataModel"
import { useMutation } from "convex/react"
import type { FunctionArgs } from "convex/server"
import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~components/ui/accordion"
import { Button } from "~components/ui/button"
import { Label } from "~components/ui/label"
import { RadioGroup, RadioGroupItem } from "~components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~components/ui/select"

import {
  EditSheetInput as Input,
  EditSheetTextarea as Textarea
} from "./EditSheetFormInputs"

type UpdateMangaData = FunctionArgs<typeof api.manga.updateManga>["data"]

type FormProps = {
  data: Doc<"Manga">
  setEditOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function EditSheetForm({ data, setEditOpen }: FormProps) {
  const updateManga = useMutation(api.manga.updateManga)
      const CONVEX_SITE_URL = process.env.PLASMO_PUBLIC_CONVEX_SITE_URL
  const coverSrc = data.cover_url
    ? `${CONVEX_SITE_URL}/mangadex-cover?url=${encodeURIComponent(
        data.cover_url
      )}`
    : ""
  const allowedStatuses = ["reading", "planned", "haitus", "archived"] as const
  type Status = (typeof allowedStatuses)[number]
  function isStatus(x: string): x is Status {
    return (allowedStatuses as readonly string[]).includes(x)
  }
  const [status, setStatus] = useState<Status>(data.status ?? "planned")
  // Radio selections (used to set textarea values)
  const [altTitle, setAltTitle] = useState<string>(data.display_title)
  // This is a URL (since your schema has site_url + alternative_sites)
  const [altSite, setAltSite] = useState<string>(data.site_url)
  const { user } = useUser()
  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const updates: UpdateMangaData = {}

    const coverUrl = String(fd.get("cover_url") ?? "").trim()
    if (coverUrl !== data.cover_url) updates.cover_url = coverUrl

    // Prefer radio-picked values if present, otherwise use textarea values
    const titleRadio = String(fd.get("display_title_radio") ?? "").trim()
    const titleTextarea = String(fd.get("display_title") ?? "").trim()
    const title = titleRadio || titleTextarea
    if (title !== data.display_title) updates.display_title = title

    // Site name (replaces "source")
    const siteNameRadio = String(fd.get("site_name_radio") ?? "").trim()
    const siteNameTextarea = String(fd.get("site_name") ?? "").trim()
    const siteName = siteNameRadio || siteNameTextarea
    if (siteName !== data.site_name) updates.site_name = siteName

    // Site URL (chosen from alternative sites radio group)
    const siteUrlRadio = String(fd.get("site_url_radio") ?? "").trim()
    if (siteUrlRadio && siteUrlRadio !== data.site_url) {
      updates.site_url = siteUrlRadio
    }

    const chapterStr = String(fd.get("chapter_number") ?? "").trim()
    if (chapterStr !== "") {
      const chapter = Number(chapterStr)
      if (!Number.isNaN(chapter) && chapter !== data.chapter_number) {
        updates.chapter_number = chapter
      }
    }

    const pctStr = String(fd.get("scroll_percentage") ?? "").trim()
    if (pctStr !== "") {
      const pct = Number(pctStr)
      if (!Number.isNaN(pct) && pct !== data.scroll_percentage) {
        updates.scroll_percentage = pct
      }
    }

    const statusRaw = String(fd.get("status") ?? "").trim()
    if (isStatus(statusRaw) && statusRaw !== data.status) {
      updates.status = statusRaw
    }

    if (Object.keys(updates).length === 0) {
      setEditOpen(false)
      return
    }
    if (!user) return
    await updateManga({ id: data._id, user_id: user.id, data: updates })
    setEditOpen(false)
  }
  const sectiontyles = "bg-zinc-900 p-2 rounded-xl w-full"
  return (
    <form onSubmit={onSave} className="grid gap-2 mt-5">
      <div className={sectiontyles}>
        <div className="overflow-hidden border-4 rounded-xl">
          <img src={coverSrc} alt="" className="" />
        </div>
        <Textarea
          id="cover-url"
          title="Cover Url"
          name="cover_url"
          defaultValue={data.cover_url}
        />
      </div>
      <div className={sectiontyles}>
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
      <div className={sectiontyles}>
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
              onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger
                id="status"
                className="w-full mt-1.5 bg-black border-none ">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="reading">reading</SelectItem>
                  <SelectItem value="planned">planned</SelectItem>
                  <SelectItem value="haitus">haitus</SelectItem>
                  <SelectItem value="archived">archived</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
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
        <Accordion type="single" collapsible>
          <AccordionItem value="alternative-titles">
            <AccordionTrigger>Alternative titles</AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={altTitle}
                onValueChange={(v) => setAltTitle(v)}>
                {data.alternative_titles.map((titleItem, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={titleItem}
                      id={`alt-title-${idx}`}
                      title={titleItem}
                    />
                    <Label htmlFor={`alt-title-${idx}`}>{titleItem}</Label>
                  </div>
                ))}
              </RadioGroup>
              {/* Feed into FormData without colliding with the textarea name */}
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
              <RadioGroup value={altSite} onValueChange={(v) => setAltSite(v)}>
                {data.alternative_sites.map((siteItem, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <RadioGroupItem value={siteItem} id={`alt-site-${idx}`} />
                    <Label htmlFor={`alt-site-${idx}`}>{siteItem}</Label>
                  </div>
                ))}
              </RadioGroup>
              {/* Feed into FormData without colliding with the textarea name */}
              <input type="hidden" name="site_url_radio" value={altSite} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <div className="sticky bottom-0 z-50 bg-background flex gap-1 p-3 justify-end">
        <Button type="submit">Save</Button>
        <Button type="button" onClick={() => setEditOpen(false)}>
          Close
        </Button>
      </div>
    </form>
  )
}
