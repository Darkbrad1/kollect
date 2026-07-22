import {
  ClerkProvider,
  Show,
  useAuth,
  UserButton,
  useUser,
} from "@clerk/chrome-extension";
import { ConvexProviderWithAuth, useMutation } from "convex/react";

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

import AuthenticateUser from "~/components/AuthenticateUser";
import { api } from "convex/_generated/api";

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST;

if (!PUBLISHABLE_KEY || !SYNC_HOST) {
  throw new Error(
    "Please add the PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY and PLASMO_PUBLIC_CLERK_SYNC_HOST to the .env.development file",
  );
}
export default function Popup() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/popup.html"
      syncHost={SYNC_HOST}
    >
      {/*<ClerkTokenSync />*/}
      <ConvexProviderWithAuth client={convex} useAuth={useConvexClerkAuth}>
        <div className="h-[600px] w-[800px] overflow-hidden">
          <Show when="signed-out">
            <AuthenticateUser />
          </Show>

          {/*<EnsureUser />*/}
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
