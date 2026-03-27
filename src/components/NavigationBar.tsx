import { UserButton } from "@clerk/clerk-react"
import {
  Archive,
  BookMarked,
  BookOpenText,
  LibraryBig
  // Settings,
} from "lucide-react"

import { useAppState } from "~components/AppStateProvider"
import RadioDropdownMenu from "~components/RadioDropdownMenu"
import SearchBox from "~components/SearchBox"
import { Button } from "~components/ui/button"
import { ButtonGroup } from "~components/ui/button-group"

function NavigationBar() {
  // Access current page and setter from global state
  const { page, setPage } = useAppState()
  const activeColor = "bg-accent text-black hover:bg-accent"

  return (
    <>
      {/* Top navigation bar container */}
      <div className="flex gap-2 p-3">
        {/* Group of buttons for switching between manga pages/statuses */}
        <ButtonGroup>
          {/* Reading page button */}
          <Button
            className={page == "reading" ? activeColor : ""}
            onClick={() => setPage("reading")}>
            <BookOpenText />
          </Button>

          {/* Hiatus page button */}
          <Button
            className={page == "haitus" ? activeColor : ""}
            onClick={() => setPage("haitus")}>
            <BookMarked />
          </Button>

          {/* Planned page button */}
          <Button
            className={page == "planned" ? activeColor : ""}
            onClick={() => setPage("planned")}>
            <LibraryBig />
          </Button>

          {/* Archived page button */}
          <Button
            className={page == "archived" ? activeColor : ""}
            onClick={() => setPage("archived")}>
            <Archive />
          </Button>
        </ButtonGroup>

        {/* Search input for filtering manga */}
        <SearchBox />
        {/* Dropdown menu for view options */}
        <RadioDropdownMenu />
        {/* Settings button */}
        <UserButton />
        {/* {me?.username} */}
        {/* <Button>
                    <Settings />
                </Button> */}
      </div>
    </>
  )
}

// Export the navigation bar component
export default NavigationBar
