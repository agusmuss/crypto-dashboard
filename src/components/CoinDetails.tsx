import { useEffect, useState } from 'react'
import type { ChartRange, Coin } from '../types'

type CoinDetailsProps = {
  coin: Coin | null
  formatCurrency: (value: number) => string
  formatNumber: (value: number) => string
  chartData: number[]
  chartRange: ChartRange
  onRangeChange: (range: ChartRange) => void
  chartLoading: boolean
  chartError: string | null
}

const changeColor = (value: number) =>
  value >= 0 ? 'text-emerald-600' : 'text-red-500'

type SparklineProps = {
  data: number[]
  label: string
}

function Sparkline({ data, label }: SparklineProps) {
  const width = 320
  const height = 90
  const padding = 6

  if (data.length < 2) {
    return null
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const isUp = data[data.length - 1] >= data[0]
  const lineColor = isUp ? '#22c55e' : '#ef4444'

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2)
      const y =
        height -
        padding -
        ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')

  const path = `M ${points.split(' ').join(' L ')}`
  const areaPath = `${path} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-24 w-full"
      role="img"
      aria-label={label}
    >
      <path d={areaPath} fill={lineColor} opacity={0.12} />
      <path d={path} fill="none" stroke={lineColor} strokeWidth={2} />
    </svg>
  )
}

export default function CoinDetails({
  coin,
  formatCurrency,
  formatNumber,
  chartData,
  chartRange,
  onRangeChange,
  chartLoading,
  chartError,
}: CoinDetailsProps) {
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    setShowChart(false)
  }, [coin?.id])

  if (!coin) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Select a coin to see details.
      </div>
    )
  }

  const changes: Array<{
    label: string
    range: ChartRange
    value: number | null | undefined
  }> = [
    { label: '24h', range: '1D', value: coin.price_change_percentage_24h },
    { label: '7d', range: '7D', value: coin.price_change_percentage_7d_in_currency },
    { label: '30d', range: '30D', value: coin.price_change_percentage_30d_in_currency },
    { label: '1y', range: '1Y', value: coin.price_change_percentage_1y_in_currency },
  ]

  const handleRangeChange = (range: ChartRange) => {
    onRangeChange(range)
    setShowChart(true)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={coin.image} alt={coin.name} className="h-12 w-12 rounded-full" />
          <div>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400">#{coin.market_cap_rank}</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{coin.name}</h2>
            <p className="text-sm uppercase text-slate-500 dark:text-slate-400">{coin.symbol}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
          Live
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Current price</p>
          <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
            {formatCurrency(coin.current_price)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Market cap</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {formatNumber(coin.market_cap)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">24h volume</p>
          <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
            {formatNumber(coin.total_volume)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <p className="text-xs uppercase text-slate-500 dark:text-slate-400">24h high / low</p>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(coin.high_24h ?? 0)} / {formatCurrency(coin.low_24h ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Price trend · {chartRange}
        </p>
        <button
          type="button"
          onClick={() => setShowChart((prev) => !prev)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
        >
          {showChart ? 'Hide chart' : 'Show chart'}
        </button>
      </div>

      {showChart ? (
        chartLoading ? (
          <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Loading chart data...
          </div>
        ) : chartError ? (
          <div className="mt-3 rounded-lg border border-dashed border-red-200 p-4 text-center text-sm text-red-500 dark:border-red-900/50 dark:text-red-300">
            Unable to load chart data.
          </div>
        ) : chartData.length ? (
          <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <Sparkline data={chartData} label={`${chartRange} price trend`} />
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            No chart data available.
          </div>
        )
      ) : null}

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Price change
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {changes.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleRangeChange(item.range)}
              aria-pressed={chartRange === item.range}
              className={`rounded-lg border px-3 py-3 text-center text-sm font-semibold transition ${
                chartRange === item.range
                  ? 'border-slate-900 bg-slate-50 shadow-sm dark:border-slate-200 dark:bg-slate-800'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
              }`}
            >
              <p className="text-xs uppercase text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className={changeColor(item.value ?? 0)}>
                {item.value !== null && item.value !== undefined
                  ? `${item.value.toFixed(2)}%`
                  : '—'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
