"use client"
import { useState } from "react"
import { SearchIcon, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AssetSearchBarProps {
  value: string
  onChange: (value: string) => void
  resultCount: number
  className?: string
}

const SYNTAX_HINTS = [
  "role:router",
  "role:web",
  "role:database",
  "tls:true",
  "auth:true",
  "severity:critical",
]

export default function AssetSearchBar({
  value,
  onChange,
  resultCount,
  className,
}: AssetSearchBarProps) {
  const [draft, setDraft] = useState(value)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onChange(draft)
  }

  const handleClear = () => {
    setDraft("")
    onChange("")
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative w-full">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Rechercher un actif — ex: role:web tls:true 165.211.20"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-14 pl-12 pr-28 text-base rounded-full shadow-sm"
          />
          {draft && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-24 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
          >
            Rechercher
          </Button>
        </form>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Essayez :</span>
          {SYNTAX_HINTS.map((hint) => (
            <button
              key={hint}
              type="button"
              onClick={() => {
                const next = draft ? `${draft} ${hint}` : hint
                setDraft(next)
                onChange(next)
              }}
              className="rounded-full border bg-muted/50 px-3 py-1 text-sm text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted-foreground">
          {resultCount} résultat{resultCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  )
}