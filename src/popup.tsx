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
            afterSignOutUrl="/popup.html">
            <ClerkTokenSync />
            <ConvexProviderWithAuth
                client={convex}
                useAuth={useConvexClerkAuth}>
                <div className="min-h-[600px] min-w-[800px]">
                    <Show when="signed-out">
                        <SignIn></SignIn>
                    </Show>

                    <Show when="signed-in">
                        <AppStateProvider>
                            <div className="flex flex-col gap-4 p-3">
                                <NavigationBar />
                                <Main />
                            </div>
                        </AppStateProvider>
                    </Show>
                </div>
            </ConvexProviderWithAuth>
        </ClerkProvider>
    );
}
