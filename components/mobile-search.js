"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export function MobileSearch({ onSearch, onFilter, placeholder = "Search...", filters, className }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleSearch = (value) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  const clearSearch = () => {
    setSearchValue("")
    onSearch?.("")
    setIsExpanded(false)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Mobile Search */}
      <div className="flex-1 relative">
        {!isExpanded ? (
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 mobile-button"
            onClick={() => setIsExpanded(true)}
          >
            <Search className="h-4 w-4 mr-2" />
            {placeholder}
          </Button>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={placeholder}
              className="pl-10 pr-10 mobile-input"
              onBlur={() => {
                if (!searchValue) {
                  setIsExpanded(false)
                }
              }}
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter Button */}
      {filters && (
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mobile-button">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="py-4">{filters}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
