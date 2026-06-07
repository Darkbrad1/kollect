//default values 
const defaultView = "Card"
const defaultStatus = "planned"


import React, { createContext, useContext, useState } from "react";
import type { Id } from "convex/_generated/dataModel";

// Define the shape of the global app state stored in context
type Status = "reading" | "planned" | "hiatus" | "archived";

type AppState = {
    // Current view mode (e.g., "Detailed", "Card")
    view: string;
    setView: (v: string) => void;
    // Current search query
    search: string;
    setSearch: (s: string) => void;

    // Current page/section of the app (e.g., "reading", "planned")
    status: Status;
    setStatus: (v: Status) => void;

    target: Id<"userMangas"> | undefined;
    setTarget: (target: Id<"userMangas">) => void;
};

// Create the context with a default null value
// (null is used so we can detect misuse outside the provider)
const AppStateContext = createContext<AppState | null>(null);

// Context provider component that wraps the app
export function AppStateProvider({ children }: { children: React.ReactNode }) {
    // State for controlling how content is displayed
    const [view, setView] = useState(defaultView);
    // State for storing the current search input
    const [search, setSearch] = useState("");
    // State for tracking which status the user is on
    const [status, setStatus] = useState<Status>(defaultStatus));

    const [target, setTarget] = useState<Id<"userMangas">>();

    // Provide state values and their setters to all child components
    return (
        <AppStateContext.Provider
            value={{
                view,
                setView,
                search,
                setSearch,
                status,
                setStatus,
                target,
                setTarget,
            }}>
            {children}
        </AppStateContext.Provider>
    );
}

// Custom hook for consuming the AppState context
export function useAppState() {
    const ctx = useContext(AppStateContext);
    // Throw an error if the hook is used outside of the provider
    if (!ctx) {
        throw new Error("useAppState must be used inside AppStateProvider");
    }
    // Return the context state and setters
    return ctx;
}
