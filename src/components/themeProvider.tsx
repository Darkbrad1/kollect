import { createContext, useContext, useEffect, useState } from "react";
// Supported theme values
type Theme = "kollect-theme" | "dark" | "light" | "system";

// Props accepted by the ThemeProvider component
type ThemeProviderProps = {
    children: React.ReactNode;
    defaultTheme?: Theme; // Fallback theme if none is stored
    storageKey?: string; // localStorage key for persisting theme
};

// Shape of the theme context state
type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

// Initial context state used before the provider is mounted
const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
};

// Create the Theme context
const ThemeProviderContext =
    createContext<ThemeProviderState>(initialState);

// ThemeProvider manages theme state and applies it to the document
export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    // Initialize theme from localStorage or fallback to defaultTheme
    const [theme, setTheme] = useState<Theme>(() =>
        (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    // Apply the theme to the root HTML element whenever it changes
    useEffect(() => {
        const root = window.document.documentElement;
        // Remove all possible theme classes first
        root.classList.remove("light", "dark", "kollect-theme");
        // If theme is set to system...
        if (theme === "system") {
            // Detect the user's system color scheme
            const systemTheme = window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches
                ? "dark"
                : "light";
            // Apply the detected system theme
            root.classList.add(systemTheme);
            return;
        }
        // Otherwise, apply the selected theme directly
        root.classList.add(theme);
    }, [theme]);
    // Context value exposed to consumers
    const value = {
        theme,
        setTheme: (theme: Theme) => {
            // Persist the selected theme in localStorage
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
    };

    return (
        // Provide theme state and updater to all child components
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

// Custom hook for accessing the theme context
export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    // Ensure the hook is used within a ThemeProvider
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
};