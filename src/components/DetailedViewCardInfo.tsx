import type { Doc } from "convex/_generated/dataModel"

import PercentageBar from "~components/DetailedViewCardPercentageBar"
import { useRelativeTime } from "~hooks/useRelativeTime"

type DataProp = {
  data: Doc<"Manga">
}

export default function DetailedViewCardInfo({ data }: DataProp) {
  // Updates automatically every 60 seconds
  const lastRead = useRelativeTime(data.last_read_timeStamp, 1000)

  return (
    <div className="w-full self-center grid gap-1">
      <div className="flex justify-between">
        <h1 className="font-black line-clamp-1">{data.display_title}</h1>
        <p className="font-bold text-(--text-clr-2) self-end">
          {data.chapter_number}
        </p>
      </div>
      <PercentageBar percentage={data.scroll_percentage} />
      <div className="flex gap-1 text-sm">
        <p className="font-bold text-(--text-clr-1)">{data.site_name}</p>
        <p className="font-medium text-(--text-clr-2)">{lastRead}</p>
        <p className="font-medium ml-auto text-(--text-clr-2)">
          {data.scroll_percentage}%
        </p>
      </div>
    </div>
  )
}
