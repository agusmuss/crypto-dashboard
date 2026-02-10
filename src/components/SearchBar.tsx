import type { ChangeEvent } from 'react'

type SearchBarProps = {
  query: string
  onChange: (value: string) => void
  showFavoritesOnly: boolean
  onToggleFavorites: () => void
}

export default function SearchBar({
  query,
  onChange,
  showFavoritesOnly,
  onToggleFavorites,
}: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Search
        </label>
        <input
          value={query}
          onChange={handleChange}
          placeholder="Search by name or symbol"
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFavorites}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            showFavoritesOnly
              ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-100 dark:text-slate-900'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          {showFavoritesOnly ? 'Favorites on' : 'Show favorites'}
        </button>
      </div>
    </div>
  )
}
