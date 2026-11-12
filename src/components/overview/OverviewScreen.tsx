import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { MarketAsset } from '../../types/market';
import { SECTOR_PERFORMANCE, MARKET_NEWS, generateCandlesticks } from '../../data/mockMarketData';
import { MiniSparkline } from '../common/MiniSparkline';
import { ArrowUpRight, ArrowDownRight, TrendingUp, BarChart2, Plus, Check, ExternalLink, Globe, ShieldCheck } from 'lucide-react';

export const OverviewScreen: React.FC = () => {
  const { assets, selectAsset, setActiveScreen, toggleWatchlist, isInWatchlist, openDetailModal } = useMarket();

  // Fast Chart symbol choice
  const [fastChartSymbol, setFastChartSymbol] = useState<string>('SPX');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y'>('1M');
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers' | 'active' | 'highs'>('gainers');

  const fastAsset = useMemo(() => {
    return assets.find((a) => a.symbol === fastChartSymbol) || assets[0];
  }, [assets, fastChartSymbol]);

  // Generate chart data for fast chart
  const fastChartData = useMemo(() => {
    return generateCandlesticks(fastAsset.price, timeframe, 36);
  }, [fastAsset.price, timeframe]);

  // Movers calculation
  const stockAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'stocks' || a.category === 'indices');
  }, [assets]);

  const topGainers = useMemo(() => {
    return [...stockAssets].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  }, [stockAssets]);

  const topLosers = useMemo(() => {
    return [...stockAssets].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  }, [stockAssets]);

  const mostActive = useMemo(() => {
    return [...stockAssets].sort((a, b) => b.volumeRaw - a.volumeRaw).slice(0, 5);
  }, [stockAssets]);

  const fiftyTwoWeekHighs = useMemo(() => {
    return [...stockAssets]
      .filter((a) => a.high52w && a.price >= a.high52w * 0.95)
      .slice(0, 5);
  }, [stockAssets]);

  const currentMoversList = useMemo(() => {
    if (moversTab === 'gainers') return topGainers;
    if (moversTab === 'losers') return topLosers;
    if (moversTab === 'active') return mostActive;
    return fiftyTwoWeekHighs.length > 0 ? fiftyTwoWeekHighs : topGainers;
  }, [moversTab, topGainers, topLosers, mostActive, fiftyTwoWeekHighs]);

  // Fast SVG area chart rendering
  const minPrice = Math.min(...fastChartData.map((d) => d.low));
  const maxPrice = Math.max(...fastChartData.map((d) => d.high));
  const priceRange = maxPrice - minPrice || 1;
  const chartHeight = 220;
  const chartWidth = 720;
  const isOverallUp = fastAsset.change >= 0;

  const points = fastChartData.map((d, i) => {
    const x = (i / (fastChartData.length - 1)) * chartWidth;
    const y = chartHeight - ((d.close - minPrice) / priceRange) * (chartHeight - 20) - 10;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Global Markets Header Kicker & Key Benchmark Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Global Markets Overview
          </h1>
          <div className="text-xs text-[#787b86] mt-0.5">
            Real-time equity indices, currency pairs, crypto assets, and commodities
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveScreen('heatmap')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] border border-[#2a2e39] rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>Open Heatmap</span>
          </button>
          <button
            onClick={() => {
              selectAsset(fastAsset);
              setActiveScreen('chart');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Launch SuperChart</span>
          </button>
        </div>
      </div>

      {/* 2. Top Fast Interactive Chart Widget */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2a2e39]">
          {/* Symbol Quick Select Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { sym: 'SPX', name: 'S&P 500' },
              { sym: 'NDX', name: 'Nasdaq 100' },
              { sym: 'BTCUSD', name: 'Bitcoin' },
              { sym: 'XAUUSD', name: 'Gold' },
              { sym: 'EURUSD', name: 'EUR/USD' },
              { sym: 'US10Y', name: '10Y Yield' },
            ].map((item) => (
              <button
                key={item.sym}
                onClick={() => setFastChartSymbol(item.sym)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  fastChartSymbol === item.sym
                    ? 'bg-[#2962ff] text-white'
                    : 'bg-[#131722] text-[#787b86] hover:text-white hover:bg-[#2a2e39]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-md border border-[#2a2e39]">
            {(['1D', '5D', '1M', '6M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  timeframe === tf ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Price & Change Banner */}
        <div className="flex items-baseline justify-between pt-4 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white tracking-tight">{fastAsset.name}</span>
              <span className="text-xs text-[#787b86] font-mono">({fastAsset.symbol})</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-white">
                {fastAsset.category === 'forex' || fastAsset.price < 5
                  ? fastAsset.price.toFixed(4)
                  : fastAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {fastAsset.currency === '%' ? '%' : ''}
              </span>
              <span
                className={`inline-flex items-center gap-1 font-mono tabular-nums text-sm font-semibold ${
                  isOverallUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isOverallUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {isOverallUp ? '+' : ''}
                {fastAsset.change.toFixed(2)} ({isOverallUp ? '+' : ''}
                {fastAsset.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs text-right">
            <div>
              <div className="text-[#787b86]">24h High</div>
              <div className="font-mono text-white font-medium">{fastAsset.high24h.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[#787b86]">24h Low</div>
              <div className="font-mono text-white font-medium">{fastAsset.low24h.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[#787b86]">Volume</div>
              <div className="font-mono text-white font-medium">{fastAsset.volume}</div>
            </div>
          </div>
        </div>

        {/* SVG Spark Area Chart */}
        <div className="w-full overflow-hidden mt-4 pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
            <defs>
              <linearGradient id="fastChartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isOverallUp ? '#089981' : '#f23645'} stopOpacity="0.28" />
                <stop offset="100%" stopColor={isOverallUp ? '#089981' : '#f23645'} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#fastChartGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke={isOverallUp ? '#089981' : '#f23645'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 3. Two-Column Layout: Market Movers Table (Left) + Sectors Breakdown (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Market Movers */}
        <div className="lg:col-span-2 bg-[#1e222d] border border-[#2a2e39] rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2a2e39]">
            <h2 className="text-base font-bold text-white tracking-tight">Market Movers</h2>
            <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-md border border-[#2a2e39] text-xs">
              {[
                { id: 'gainers', label: 'Top Gainers' },
                { id: 'losers', label: 'Top Losers' },
                { id: 'active', label: 'Most Active' },
                { id: 'highs', label: '52W Highs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMoversTab(tab.id as any)}
                  className={`px-2.5 py-1 font-medium rounded transition-colors cursor-pointer ${
                    moversTab === tab.id ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-[#d1d4dc]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Movers Table */}
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#787b86] border-b border-[#2a2e39]">
                  <th className="py-2.5 font-medium">Symbol</th>
                  <th className="py-2.5 font-medium text-right">Price</th>
                  <th className="py-2.5 font-medium text-right">Change %</th>
                  <th className="py-2.5 font-medium text-right hidden sm:table-cell">Volume</th>
                  <th className="py-2.5 font-medium text-center hidden md:table-cell">Trend</th>
                  <th className="py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]">
                {currentMoversList.map((item) => {
                  const isUp = item.change >= 0;
                  const inWatch = isInWatchlist(item.symbol);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#2a2e39]/50 transition-colors group cursor-pointer"
                      onClick={() => openDetailModal(item)}
                    >
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                            style={{ backgroundColor: item.logoBg || '#2962ff' }}
                          >
                            {item.logoText || item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-[#2962ff] transition-colors">
                              {item.symbol}
                            </div>
                            <div className="text-[11px] text-[#787b86] truncate max-w-[140px]">
                              {item.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-right font-mono tabular-nums font-medium text-white">
                        ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 text-right font-mono tabular-nums font-semibold">
                        <span
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                            isUp
                              ? 'text-[#089981] bg-[#089981]/10'
                              : 'text-[#f23645] bg-[#f23645]/10'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono tabular-nums text-[#787b86] hidden sm:table-cell">
                        {item.volume}
                      </td>

                      <td className="py-3 text-center hidden md:table-cell">
                        <MiniSparkline data={item.sparkline} isPositive={isUp} width={70} height={22} />
                      </td>

                      <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleWatchlist(item.symbol)}
                            className={`p-1.5 rounded transition-colors ${
                              inWatch ? 'text-[#2962ff] bg-[#2962ff]/10' : 'text-[#787b86] hover:text-white'
                            }`}
                            title={inWatch ? 'In Watchlist' : 'Add to Watchlist'}
                          >
                            {inWatch ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              selectAsset(item);
                              setActiveScreen('chart');
                            }}
                            className="p-1.5 text-[#787b86] hover:text-white rounded transition-colors"
                            title="Open in SuperChart"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Sectors Performance */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
            <h2 className="text-base font-bold text-white tracking-tight">Sector Performance</h2>
            <span className="text-xs text-[#787b86]">1-Day Return</span>
          </div>

          <div className="space-y-3.5 mt-3.5">
            {SECTOR_PERFORMANCE.map((sector) => {
              const isUp = sector.changePercent >= 0;
              const barWidth = Math.min(100, Math.abs(sector.changePercent) * 25);
              return (
                <div key={sector.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#d1d4dc] font-medium">{sector.name}</span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        isUp ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {sector.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Horizontal progress bar */}
                  <div className="w-full bg-[#131722] h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUp ? 'bg-[#089981]' : 'bg-[#f23645]'
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#787b86]">
                    <span>Market Cap: {sector.marketCap}</span>
                    <span>Lead: {sector.topStock}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Curated Financial News Stream */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#2962ff]" />
            <h2 className="text-base font-bold text-white tracking-tight">Market News & Dispatches</h2>
          </div>
          <span className="text-xs text-[#787b86]">Curated real-time feed</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {MARKET_NEWS.map((news) => (
            <div
              key={news.id}
              className="p-4 bg-[#131722] hover:bg-[#2a2e39]/50 border border-[#2a2e39] rounded-lg transition-colors flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#787b86] mb-2">
                  <span className="font-medium text-[#2962ff]">{news.category}</span>
                  <span>{news.time}</span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-[#2962ff] transition-colors line-clamp-2 leading-snug">
                  {news.title}
                </h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#787b86] mt-4 pt-3 border-t border-[#2a2e39]">
                <span>{news.source}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium capitalize ${
                      news.sentiment === 'bullish'
                        ? 'text-[#089981]'
                        : news.sentiment === 'bearish'
                        ? 'text-[#f23645]'
                        : 'text-[#787b86]'
                    }`}
                  >
                    {news.sentiment}
                  </span>
                  <span>·</span>
                  <span>{news.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
