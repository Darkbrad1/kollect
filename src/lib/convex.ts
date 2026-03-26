import { ConvexReactClient } from "convex/react"

const convexUrl = process.env.PLASMO_PUBLIC_CONVEX_URL

if (!convexUrl) {
  throw new Error("Missing PLASMO_PUBLIC_CONVEX_URL")
}

export const convex = new ConvexReactClient(convexUrl)