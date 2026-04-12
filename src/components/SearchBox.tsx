import { useAppState } from "~/components/AppStateProvider.tsx"
import { Input } from "~/components/ui/input"

// SearchBox component provides a text input for filtering manga
export default function SearchBox() {
  // Access current search value and setter from global state
  const { search, setSearch } = useAppState()

  return (
    // Search input field
    <Input
      className="bg-[#27272a]" // Dark background styling
      type="search" // Enables browser search input behavior
      placeholder="Search" // Placeholder text shown when empty
      value={search} // Controlled input tied to global search state
      onChange={(e) =>
        // Update search state in lowercase for case-insensitive matching
        setSearch(e.target.value.toLowerCase())
      }
    />
  )
}
