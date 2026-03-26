import { useCallback, useMemo } from "react"
import { useAuth } from "@clerk/chrome-extension"

export function useConvexClerkAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!isSignedIn) {
        return null
      }

      return await getToken({
        template: "convex",
        skipCache: forceRefreshToken
      })
    },
    [getToken, isSignedIn]
  )

  return useMemo(
    () => ({
      isLoading: !isLoaded,
      isAuthenticated: !!isSignedIn,
      fetchAccessToken
    }),
    [fetchAccessToken, isLoaded, isSignedIn]
  )
}