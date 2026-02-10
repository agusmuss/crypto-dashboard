export type Coin = {
  id: string
  name: string
  symbol: string
  image: string
  current_price: number
  market_cap: number
  total_volume: number
  market_cap_rank: number
  price_change_percentage_24h: number | null
  price_change_percentage_7d_in_currency: number | null
  price_change_percentage_30d_in_currency: number | null
  price_change_percentage_1y_in_currency: number | null
  sparkline_in_7d?: {
    price: number[]
  }
  high_24h: number | null
  low_24h: number | null
}

export type ChartRange = '1D' | '7D' | '30D' | '1Y'

