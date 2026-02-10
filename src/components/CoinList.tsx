import type { Coin } from '../types'

type CoinListProps = {
  coins: Coin[]
  selectedId: string | null
  favorites: string[]
  onSelect: (id: string) => void
  onToggleFavorite: (id: string) => void
  formatCurrency: (value: number) => string
  theme: 'light' | 'dark'
  onRefresh: () => void
  refreshing: boolean
  lastUpdatedLabel: string
  refreshError: string | null
}

const COIN_COLORS: Record<string, string> = {
  btc: '#b45309',
  eth: '#4f46e5',
  usdt: '#14b8a6',
  'bsc-usd': '#14b8a6',
  bnb: '#a16207',
  xrp: '#334155',
  usdc: '#1d4ed8',
  sol: '#7c3aed',
  ada: '#0f766e',
  doge: '#d4a017',
  ldo: '#93c5fd',
  steth: '#93c5fd',
  figr_heloc: '#c4b5fd',
  bch: '#22c55e',
  wsteth: '#3b82f6',
  usds: '#f97316',
  wbeth: '#facc15',
}

export default function CoinList({
  coins,
  selectedId,
  favorites,
  onSelect,
  onToggleFavorite,
  formatCurrency,
  theme,
  onRefresh,
  refreshing,
  lastUpdatedLabel,
  refreshError,
}: CoinListProps) {
  const getSelectedBackground = (coin: Coin) => {
    if (theme === 'dark') return '#1e293b'
    return COIN_COLORS[coin.symbol.toLowerCase()] ?? '#0f172a'
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Top coins
          </p>
          <p
            className={`text-[11px] ${
              refreshError ? 'text-red-500' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {refreshError ? 'Unable to refresh.' : `Updated ${lastUpdatedLabel}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="grid grid-cols-[1.5fr_1fr_1fr_64px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>Coin</span>
        <span>Price</span>
        <span>24h</span>
        <span className="text-right">Fav</span>
      </div>
      <div className="max-h-[520px] overflow-y-auto">
        {coins.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
            No coins match your search.
          </div>
        ) : (
          coins.map((coin) => {
            const isSelected = coin.id === selectedId
            const isFavorite = favorites.includes(coin.id)
            const change = coin.price_change_percentage_24h ?? 0
            const changeClass =
              change >= 0 ? 'text-emerald-600' : 'text-red-500'

            return (
              <button
                key={coin.id}
                type="button"
                onClick={() => onSelect(coin.id)}
                style={isSelected ? { backgroundColor: getSelectedBackground(coin) } : undefined}
                className={`grid w-full grid-cols-[1.5fr_1fr_1fr_64px] items-center gap-4 px-5 py-4 text-left text-sm transition ${
                  isSelected
                    ? 'text-white'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="h-7 w-7 rounded-full"
                  />
                  <div>
                    <p className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                      {coin.name}
                    </p>
                    <p className={`text-xs uppercase ${isSelected ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                      {coin.symbol}
                    </p>
                  </div>
                </div>
                <span className={isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}>
                  {formatCurrency(coin.current_price)}
                </span>
                <span className={`${changeClass} font-semibold`}>
                  {change.toFixed(2)}%
                </span>
                <span className="text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onToggleFavorite(coin.id)
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      isFavorite
                        ? 'border-amber-300 bg-amber-300/20 text-amber-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
                    }`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorite ? (
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="h-4 w-4 fill-current"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.157c.969 0 1.371 1.24.588 1.81l-3.363 2.444a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.363-2.444a1 1 0 00-1.175 0l-3.363 2.444c-.784.57-1.838-.197-1.539-1.118l1.285-3.955a1.25 1.25 0 00-.363-1.118L2.218 9.382c-.783-.57-.38-1.81.588-1.81h4.157a1 1 0 00.95-.69l1.286-3.955z" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.75.75 0 011.04 0l2.668 2.534c.236.224.543.354.868.37l3.716.177a.75.75 0 01.42 1.31l-2.78 2.23a1.25 1.25 0 00-.404 1.29l.91 3.536a.75.75 0 01-1.1.82l-3.154-1.86a1.25 1.25 0 00-1.268 0l-3.154 1.86a.75.75 0 01-1.1-.82l.91-3.536a1.25 1.25 0 00-.404-1.29l-2.78-2.23a.75.75 0 01.42-1.31l3.716-.177a1.25 1.25 0 00.868-.37l2.668-2.534z"
                        />
                      </svg>
                    )}
                  </button>
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
