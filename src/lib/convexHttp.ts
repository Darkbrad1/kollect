import { ConvexHttpClient } from "convex/browser"
import { convexUrl } from "./convex"

export function createAuthedConvexClient(token: string) {
  const client = new ConvexHttpClient(convexUrl)
  client.setAuth(token)
  return client
}
