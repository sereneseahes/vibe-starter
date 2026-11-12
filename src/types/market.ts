export type MarketCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'bonds';

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  category: MarketCategory;
  sector?: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  open: number;
  previousClose: number;
  volume: string;
  volumeRaw: number;
  avgVolume?: string;
  marketCap?: string;
  marketCapRaw?: number;
  peRatio?: number;
  dividendYield?: number;
  eps?: number;
  high52w?: number;
  low52w?: number;
  sparkline: number[];
  rating: TechnicalRating;
  description?: string;
  country?: string;
  logoText?: string;
  logoBg?: string;
  flash?: 'up' | 'down' | null;
  technicals?: {
    oscillators: { buy: number; neutral: number; sell: number; rating: TechnicalRating };
    movingAverages: { buy: number; neutral: number; sell: number; rating: TechnicalRating };
    summary: TechnicalRating;
    rsi: number;
    macdSignal: 'Buy' | 'Sell' | 'Neutral';
  };
}

export interface CandlestickData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  ema50?: number;
  rsi?: number;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  symbol?: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  readTime: string;
}

export interface SectorPerformance {
  name: string;
  changePercent: number;
  marketCap: string;
  topStock: string;
}

export interface CrossRateRow {
  base: string;
  rates: Record<string, number>;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
}

export interface PaperTradePosition {
  symbol: string;
  assetName: string;
  type: 'BUY' | 'SELL';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  timestamp: number;
}
