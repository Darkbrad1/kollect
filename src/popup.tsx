import {
  ClerkProvider,
  Show,
  useAuth,
  UserButton,
} from "@clerk/chrome-extension";
import { ConvexProviderWithAuth } from "convex/react";
import { useEffect } from "react";
import { AppStateProvider } from "~/components/AppStateProvider";
import Main from "~/components/Main";
import NavigationBar from "~/components/NavigationBar";
import { convex } from "~/lib/convex";
import { useConvexClerkAuth } from "~/lib/useConvexClerkAuth";
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/AppSidebar";
import { Toaster } from "./components/ui/sonner";
import "~/style.css";

import SignIn from "~/components/SignIn";

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY");
}

function ClerkTokenSync() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    async function syncToken() {
      if (!isSignedIn) {
        await chrome.storage.local.remove("clerk_token");
        return;
      }

      const token = await getToken({
        template: "convex",
      });

      if (token) {
        await chrome.storage.local.set({ clerk_token: token });
      }
    }

    void syncToken();
  }, [getToken, isSignedIn]);

  return null;
}
export default function Popup() {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      allowedRedirectOrigins={[`chrome-extension://${chrome.runtime.id}`]}
      afterSignOutUrl="/popup.html"
    >
      <ClerkTokenSync />
      <ConvexProviderWithAuth client={convex} useAuth={useConvexClerkAuth}>
        <div className="h-[600px] w-[800px] overflow-hidden">
          <Show when="signed-out">
            <SignIn />
          </Show>

          <Show when="signed-in">
            <AppStateProvider>
              <SidebarProvider defaultOpen={false}>
                <div className="flex flex-col gap-4 p-3 w-full overflow-auto h-full">
                  <NavigationBar />
                  <Main />
                  <Toaster />
                </div>
                <AppSidebar />
              </SidebarProvider>
            </AppStateProvider>
          </Show>
        </div>
      </ConvexProviderWithAuth>
    </ClerkProvider>
  );
}
