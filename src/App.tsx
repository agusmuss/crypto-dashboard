import { useEffect, useMemo, useState } from 'react'
import CoinDetails from './components/CoinDetails'
import CoinList from './components/CoinList'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import type { ChartRange, Coin } from './types'

const API_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h,7d,30d,1y'

const FAVORITES_KEY = 'crypto-dashboard:favorites'
const THEME_KEY = 'crypto-dashboard:theme'
const BACKGROUND_KEY = 'crypto-dashboard:background'

const CHART_DAYS: Record<ChartRange, number> = {
  '1D': 1,
  '7D': 7,
  '30D': 30,
  '1Y': 365,
}

type ThemeMode = 'light' | 'dark'
type BackgroundStyle = 'soft' | 'mesh' | 'paper'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

const formatTime = (date: Date) =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.toggle('dark', mode === 'dark')
}

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY)
    if (!saved) return []
    try {
      return JSON.parse(saved) as string[]
    } catch {
      return []
    }
  })
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null
    return saved ?? 'light'
  })
  const [background, setBackground] = useState<BackgroundStyle>(() => {
    const saved = localStorage.getItem(BACKGROUND_KEY) as BackgroundStyle | null
    return saved ?? 'soft'
  })
  const [chartRange, setChartRange] = useState<ChartRange>('7D')
  const [chartData, setChartData] = useState<number[]>([])
  const [chartLoading, setChartLoading] = useState(false)
  const [chartError, setChartError] = useState<string | null>(null)
  const [chartRefreshKey, setChartRefreshKey] = useState(0)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(BACKGROUND_KEY, background)
  }, [background])

  const fetchCoins = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
      setRefreshError(null)
    } else {
      setLoading(true)
      setError(null)
    }

    try {
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Failed to fetch market data')
      }
      const data = (await response.json()) as Coin[]
      setCoins(data)
      setSelectedId((prev) =>
        data.some((coin) => coin.id === prev) ? prev : data[0]?.id ?? null
      )
      setLastUpdated(new Date())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      if (isRefresh) {
        setRefreshError(message)
      } else {
        setError(message)
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchCoins()
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const filteredCoins = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return coins.filter((coin) => {
      const matchesQuery =
        coin.name.toLowerCase().includes(normalized) ||
        coin.symbol.toLowerCase().includes(normalized)
      const matchesFavorite = !showFavoritesOnly || favorites.includes(coin.id)
      return matchesQuery && matchesFavorite
    })
  }, [coins, query, showFavoritesOnly, favorites])

  useEffect(() => {
    if (!filteredCoins.length) {
      setSelectedId(null)
      return
    }

    const exists = filteredCoins.some((coin) => coin.id === selectedId)
    if (!exists) {
      setSelectedId(filteredCoins[0]?.id ?? null)
    }
  }, [filteredCoins, selectedId])

  const selectedCoin = useMemo(() => {
    return coins.find((coin) => coin.id === selectedId) ?? null
  }, [coins, selectedId])

  useEffect(() => {
    if (!selectedCoin) {
      setChartData([])
      setChartLoading(false)
      setChartError(null)
      return
    }

    const controller = new AbortController()
    const days = CHART_DAYS[chartRange]

    const loadChart = async () => {
      setChartLoading(true)
      setChartError(null)
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/market_chart?vs_currency=usd&days=${days}`,
          { signal: controller.signal }
        )
        if (!response.ok) {
          throw new Error('Failed to fetch chart data')
        }
        const data = (await response.json()) as { prices?: [number, number][] }
        const prices = data.prices?.map((point) => point[1]) ?? []
        setChartData(prices)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        const message = err instanceof Error ? err.message : 'Unknown error'
        setChartError(message)
      } finally {
        setChartLoading(false)
      }
    }

    loadChart()

    return () => controller.abort()
  }, [selectedCoin?.id, chartRange, chartRefreshKey])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const handleRefresh = () => {
    fetchCoins(true)
    setChartRefreshKey((prev) => prev + 1)
  }

  const backgroundClass =
    theme === 'light'
      ? background === 'mesh'
        ? 'bg-mesh'
        : background === 'paper'
          ? 'bg-paper'
          : 'bg-soft-gradient'
      : ''

  const lastUpdatedLabel = lastUpdated ? formatTime(lastUpdated) : '—'

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Header />
            <div className="flex flex-wrap items-center gap-3">
              {theme === 'light' ? (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="px-2">Background</span>
                  {(['soft', 'mesh', 'paper'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setBackground(option)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        background === option
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
          <SearchBar
            query={query}
            onChange={setQuery}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly((prev) => !prev)}
          />

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Loading market data...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <CoinList
                coins={filteredCoins}
                selectedId={selectedId}
                favorites={favorites}
                onSelect={setSelectedId}
                onToggleFavorite={toggleFavorite}
                formatCurrency={formatCurrency}
                theme={theme}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                lastUpdatedLabel={lastUpdatedLabel}
                refreshError={refreshError}
              />
              <CoinDetails
                coin={selectedCoin}
                formatCurrency={formatCurrency}
                formatNumber={formatNumber}
                chartData={chartData}
                chartRange={chartRange}
                onRangeChange={setChartRange}
                chartLoading={chartLoading}
                chartError={chartError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
