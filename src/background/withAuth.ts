import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getStoredClerkToken } from "./auth"

// Type for a background handler that requires an authenticated token.
//
// We pass the resolved token into the handler so the handler
// can stay focused on its domain-specific work.
type AuthedHandler = (
  req: Parameters<PlasmoMessaging.MessageHandler>[0],
  res: Parameters<PlasmoMessaging.MessageHandler>[1],
  token: string
) => Promise<void>

// Wrap a Plasmo background message handler with token lookup.
//
// If no token exists, this returns a standard error response.
// If a token exists, the wrapped handler receives it.
export function withAuth(
  handler: AuthedHandler
): PlasmoMessaging.MessageHandler {
  return async (req, res) => {
    const token = await getStoredClerkToken()

    // Reject unauthenticated requests early.
    if (!token) {
      res.send({ ok: false, error: "Missing auth token" })
      return
    }

    // Delegate to the actual handler with the resolved token.
    await handler(req, res, token)
  }
}