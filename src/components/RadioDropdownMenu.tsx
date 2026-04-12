"use client"

// Mark this file as a client component (Next.js app router)

// Import React (needed for JSX and hooks)
// import * as React from "react";

// Import global app state hook for view management
import { useAppState } from "~/components/AppStateProvider"
// Import Button UI component
import { Button } from "~/components/ui/button"
// Import dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  // DropdownMenuSeparator,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"

export function RadioDropdownMenu() {
  // Access current view and setter from global app state
  const { view, setView } = useAppState()

  return (
    // Root dropdown menu component
    <DropdownMenu>
      {/* Button that opens the dropdown menu */}
      <DropdownMenuTrigger asChild>
        <Button>{view}</Button>
      </DropdownMenuTrigger>

      {/* Dropdown content container */}
      <DropdownMenuContent className="">
        {/* Radio group ensures only one view can be selected */}
        <DropdownMenuRadioGroup value={view} onValueChange={setView}>
          {/* Option to switch to card-based view */}
          <DropdownMenuRadioItem value="Card">Card</DropdownMenuRadioItem>

          {/* Option to switch to detailed list view */}
          <DropdownMenuRadioItem value="Detailed">
            Detailed
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Export component for use in the navigation bar
export default RadioDropdownMenu
