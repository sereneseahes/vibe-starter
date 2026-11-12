import React, { useState, useMemo, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import { generateCandlesticks, generateOrderBook } from '../../data/mockMarketData';
import { CandlestickData } from '../../types/market';
import { TechnicalRatingGauge } from '../common/TechnicalRatingGauge';
import {
  TrendingUp,
  BarChart2,
  LineChart,
  Activity,
  Bookmark,
  Bell,
  Check,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  DollarSign,
  Maximize2
} from 'lucide-react';

export const SuperChartScreen: React.FC = () => {
  const {
    selectedAsset,
    selectAsset,
    assets,
    toggleWatchlist,
    isInWatchlist,
    addAlert,
    paperBalance,
    paperPositions,
    executePaperTrade,
    closePaperPosition,
  } = useMarket();

  // Chart configuration
  const [chartType, setChartType] = useState<'candle' | 'line' | 'area'>('candle');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '6M' | '1Y' | 'ALL'>('1M');
  const [showSMA, setShowSMA] = useState<boolean>(true);
  const [showEMA, setShowEMA] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);

  // Crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Right sidebar tab
  const [sidebarTab, setSidebarTab] = useState<'technicals' | 'orderbook' | 'trade'>('technicals');

  // Trade form
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [tradeStatus, setTradeStatus] = useState<string | null>(null);

  // Generate candle data for current symbol & timeframe
  const candles = useMemo(() => {
    return generateCandlesticks(selectedAsset.price, timeframe, 52);
  }, [selectedAsset.price, timeframe]);

  // Order book
  const orderBook = useMemo(() => {
    return generateOrderBook(selectedAsset.price);
  }, [selectedAsset.price]);

  // Active hover point or latest
  const activeCandle: CandlestickData =
    hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : candles[candles.length - 1];

  // SVG Chart Geometry
  const svgWidth = 840;
  const mainHeight = 360;
  const volumeHeight = 60;
  const rsiHeight = showRSI ? 80 : 0;
  const totalSvgHeight = mainHeight + (showVolume ? volumeHeight : 0) + rsiHeight;

  const minLow = Math.min(...candles.map((c) => c.low));
  const maxHigh = Math.max(...candles.map((c) => c.high));
  const priceRange = maxHigh - minLow || 1;

  const maxVolume = Math.max(...candles.map((c) => c.volume));

  // Pixel mapping helpers
  const getX = (index: number) => {
    const padding = 15;
    const availableWidth = svgWidth - padding * 2 - 60; // 60px right axis margin
    return padding + (index / (candles.length - 1)) * availableWidth;
  };

  const getY = (price: number) => {
    const padding = 15;
    const availableHeight = mainHeight - padding * 2;
    return mainHeight - padding - ((price - minLow) / priceRange) * availableHeight;
  };

  const candleWidth = Math.max(4, (svgWidth - 90) / candles.length - 3);

  // Generate paths for SMA, EMA, Line, Area
  const smaPoints = candles
    .map((c, i) => (c.sma20 ? `${getX(i).toFixed(1)},${getY(c.sma20).toFixed(1)}` : null))
    .filter(Boolean);
  const smaPath = smaPoints.length > 0 ? `M ${smaPoints.join(' L ')}` : '';

  const emaPoints = candles
    .map((c, i) => (c.ema50 ? `${getX(i).toFixed(1)},${getY(c.ema50).toFixed(1)}` : null))
    .filter(Boolean);
  const emaPath = emaPoints.length > 0 ? `M ${emaPoints.join(' L ')}` : '';

  const linePoints = candles.map((c, i) => `${getX(i).toFixed(1)},${getY(c.close).toFixed(1)}`);
  const linePath = `M ${linePoints.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(candles.length - 1)},${mainHeight} L ${getX(0)},${mainHeight} Z`;

  // RSI points
  const rsiYOffset = mainHeight + (showVolume ? volumeHeight : 0);
  const getRsiY = (rsiVal: number) => {
    // 0 to 100 mapped to [rsiYOffset + rsiHeight - 10, rsiYOffset + 10]
    return rsiYOffset + rsiHeight - 10 - (rsiVal / 100) * (rsiHeight - 20);
  };

  const rsiPoints = candles.map((c, i) => `${getX(i).toFixed(1)},${getRsiY(c.rsi || 50).toFixed(1)}`);
  const rsiPath = `M ${rsiPoints.join(' L ')}`;

  // Mouse move handler for crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const availableWidth = svgWidth - 30 - 60;
    const ratio = Math.max(0, Math.min(1, (clientX - 15) / availableWidth));
    const idx = Math.round(ratio * (candles.length - 1));
    setHoverIndex(idx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Trade handler
  const handleBuy = () => {
    const res = executePaperTrade(selectedAsset.symbol, 'BUY', tradeShares);
    setTradeStatus(res.message);
    setTimeout(() => setTradeStatus(null), 3000);
  };

  const handleSell = () => {
    const res = executePaperTrade(selectedAsset.symbol, 'SELL', tradeShares);
    setTradeStatus(res.message);
    setTimeout(() => setTradeStatus(null), 3000);
  };

  const inWatchlist = isInWatchlist(selectedAsset.symbol);

  // User active position in this symbol
  const currentPosition = paperPositions.find((p) => p.symbol === selectedAsset.symbol);

  return (
    <div className="space-y-4 pb-12">
      {/* 1. SuperChart Header Toolbar */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Symbol info */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-white text-sm shrink-0"
              style={{ backgroundColor: selectedAsset.logoBg || '#2962ff' }}
            >
              {selectedAsset.logoText || selectedAsset.symbol.slice(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-lg tracking-tight">
                  {selectedAsset.symbol}
                </span>
                <span className="text-xs text-[#787b86] font-mono px-1.5 py-0.5 bg-[#131722] rounded">
                  {selectedAsset.exchange}
                </span>
                <span className="text-xs text-[#787b86] hidden sm:inline">{selectedAsset.name}</span>
              </div>

              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span
                  className={`text-xl font-bold font-mono tabular-nums text-white transition-colors ${
                    selectedAsset.flash === 'up' ? 'flash-up' : selectedAsset.flash === 'down' ? 'flash-down' : ''
                  }`}
                >
                  ${selectedAsset.price >= 10 ? selectedAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : selectedAsset.price.toFixed(4)}
                </span>
                <span
                  className={`font-mono tabular-nums text-xs font-semibold inline-flex items-center gap-0.5 ${
                    selectedAsset.change >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {selectedAsset.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {selectedAsset.change >= 0 ? '+' : ''}
                  {selectedAsset.change.toFixed(2)} ({selectedAsset.change >= 0 ? '+' : ''}
                  {selectedAsset.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Chart Controls Cluster */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Timeframe Select */}
            <div className="flex items-center gap-0.5 bg-[#131722] p-1 rounded-md border border-[#2a2e39] text-xs">
              {(['1D', '5D', '1M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 font-semibold rounded transition-colors cursor-pointer ${
                    timeframe === tf ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type */}
            <div className="flex items-center gap-0.5 bg-[#131722] p-1 rounded-md border border-[#2a2e39] text-xs">
              <button
                onClick={() => setChartType('candle')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  chartType === 'candle' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
                }`}
                title="Candlestick Chart"
              >
                <BarChart2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  chartType === 'line' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
                }`}
                title="Line Chart"
              >
                <LineChart className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  chartType === 'area' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
                }`}
                title="Area Mountain Chart"
              >
                <Activity className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Indicators Toggles */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer font-mono text-[11px] ${
                  showSMA ? 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40' : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
                }`}
              >
                SMA 20
              </button>
              <button
                onClick={() => setShowEMA(!showEMA)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer font-mono text-[11px] ${
                  showEMA ? 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/40' : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
                }`}
              >
                EMA 50
              </button>
              <button
                onClick={() => setShowRSI(!showRSI)}
                className={`px-2 py-1 rounded border transition-colors cursor-pointer font-mono text-[11px] ${
                  showRSI ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/40' : 'bg-[#131722] text-[#787b86] border-[#2a2e39]'
                }`}
              >
                RSI 14
              </button>
            </div>

            {/* Quick Watchlist & Alert Trigger */}
            <button
              onClick={() => toggleWatchlist(selectedAsset.symbol)}
              className={`p-2 rounded border border-[#2a2e39] transition-colors cursor-pointer ${
                inWatchlist ? 'bg-[#2962ff]/10 text-[#2962ff]' : 'bg-[#131722] text-[#787b86] hover:text-white'
              }`}
              title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              onClick={() => addAlert(selectedAsset.symbol, Number((selectedAsset.price * 1.05).toFixed(2)), 'above')}
              className="p-2 rounded bg-[#131722] border border-[#2a2e39] text-[#787b86] hover:text-white transition-colors cursor-pointer"
              title="Set Price Alert (+5%)"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* OHLCV Crosshair Inspector Bar */}
        <div className="flex items-center gap-4 text-xs font-mono pt-3 mt-3 border-t border-[#2a2e39] text-[#787b86] flex-wrap">
          <span className="text-white font-medium">{activeCandle.time}</span>
          <span>
            O: <strong className="text-white">${activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="text-white">${activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="text-white">${activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            C: <strong className="text-white">${activeCandle.close.toFixed(2)}</strong>
          </span>
          <span>
            Vol: <strong className="text-white">{(activeCandle.volume / 1000).toFixed(0)}K</strong>
          </span>
          {showSMA && activeCandle.sma20 && (
            <span className="text-[#f59e0b]">SMA20: ${activeCandle.sma20.toFixed(2)}</span>
          )}
          {showEMA && activeCandle.ema50 && (
            <span className="text-[#3b82f6]">EMA50: ${activeCandle.ema50.toFixed(2)}</span>
          )}
          {showRSI && activeCandle.rsi && (
            <span className="text-[#a855f7]">RSI: {activeCandle.rsi.toFixed(1)}</span>
          )}
        </div>
      </div>

      {/* 2. Main Workstation Grid: Chart Viewport (Left) + Analysis & Trading Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left (3 columns): Interactive Canvas Chart */}
        <div className="lg:col-span-3 bg-[#131722] border border-[#2a2e39] rounded-lg p-2 overflow-hidden relative select-none">
          <div
            ref={chartContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full relative cursor-crosshair"
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${totalSvgHeight}`}
              className="w-full h-auto overflow-visible"
            >
              <defs>
                <linearGradient id="superAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2962ff" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Price Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((pct) => {
                const y = mainHeight * pct;
                const gridPrice = maxHigh - pct * priceRange;
                return (
                  <g key={pct}>
                    <line
                      x1="0"
                      y1={y}
                      x2={svgWidth - 60}
                      y2={y}
                      stroke="#2a2e39"
                      strokeDasharray="4,4"
                      strokeWidth="1"
                    />
                    <text
                      x={svgWidth - 55}
                      y={y + 3}
                      fill="#787b86"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                    >
                      {gridPrice.toFixed(selectedAsset.price < 5 ? 3 : 2)}
                    </text>
                  </g>
                );
              })}

              {/* Volume Bars */}
              {showVolume &&
                candles.map((c, i) => {
                  const x = getX(i) - candleWidth / 2;
                  const vHeight = (c.volume / maxVolume) * (volumeHeight - 10);
                  const y = mainHeight + volumeHeight - vHeight;
                  const isUp = c.close >= c.open;
                  return (
                    <rect
                      key={`vol-${i}`}
                      x={x}
                      y={y}
                      width={candleWidth}
                      height={vHeight}
                      fill={isUp ? 'rgba(8, 153, 129, 0.35)' : 'rgba(242, 54, 69, 0.35)'}
                    />
                  );
                })}

              {/* Area Chart Mode */}
              {chartType === 'area' && (
                <>
                  <path d={areaPath} fill="url(#superAreaGradient)" />
                  <path d={linePath} fill="none" stroke="#2962ff" strokeWidth="2" />
                </>
              )}

              {/* Line Chart Mode */}
              {chartType === 'line' && (
                <path d={linePath} fill="none" stroke="#2962ff" strokeWidth="2" strokeLinecap="round" />
              )}

              {/* Candlestick Chart Mode */}
              {chartType === 'candle' &&
                candles.map((c, i) => {
                  const x = getX(i);
                  const isUp = c.close >= c.open;
                  const color = isUp ? '#089981' : '#f23645';

                  const yHigh = getY(c.high);
                  const yLow = getY(c.low);
                  const yOpen = getY(c.open);
                  const yClose = getY(c.close);

                  const bodyY = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                  return (
                    <g key={`candle-${i}`}>
                      {/* Upper & Lower Wick */}
                      <line
                        x1={x}
                        y1={yHigh}
                        x2={x}
                        y2={yLow}
                        stroke={color}
                        strokeWidth="1.2"
                      />
                      {/* Candle Body */}
                      <rect
                        x={x - candleWidth / 2}
                        y={bodyY}
                        width={candleWidth}
                        height={bodyHeight}
                        fill={color}
                        rx="1"
                      />
                    </g>
                  );
                })}

              {/* SMA 20 Overlay */}
              {showSMA && smaPath && (
                <path d={smaPath} fill="none" stroke="#f59e0b" strokeWidth="1.6" />
              )}

              {/* EMA 50 Overlay */}
              {showEMA && emaPath && (
                <path d={emaPath} fill="none" stroke="#3b82f6" strokeWidth="1.6" />
              )}

              {/* RSI Sub-Chart */}
              {showRSI && (
                <g>
                  {/* RSI Sub-pane Separator Line */}
                  <line
                    x1="0"
                    y1={rsiYOffset}
                    x2={svgWidth}
                    y2={rsiYOffset}
                    stroke="#2a2e39"
                    strokeWidth="1"
                  />
                  {/* 70 Overbought & 30 Oversold horizontal guide lines */}
                  <line
                    x1="0"
                    y1={getRsiY(70)}
                    x2={svgWidth - 60}
                    y2={getRsiY(70)}
                    stroke="#f23645"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                    opacity="0.5"
                  />
                  <line
                    x1="0"
                    y1={getRsiY(30)}
                    x2={svgWidth - 60}
                    y2={getRsiY(30)}
                    stroke="#089981"
                    strokeDasharray="2,2"
                    strokeWidth="0.8"
                    opacity="0.5"
                  />
                  <text
                    x={svgWidth - 55}
                    y={getRsiY(70) + 3}
                    fill="#f23645"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    70
                  </text>
                  <text
                    x={svgWidth - 55}
                    y={getRsiY(30) + 3}
                    fill="#089981"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                  >
                    30
                  </text>
                  {/* RSI Line */}
                  <path d={rsiPath} fill="none" stroke="#a855f7" strokeWidth="1.5" />
                  <text
                    x="10"
                    y={rsiYOffset + 16}
                    fill="#a855f7"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="JetBrains Mono"
                  >
                    RSI (14)
                  </text>
                </g>
              )}

              {/* Interactive Crosshair Lines */}
              {hoverIndex !== null && (
                <g>
                  {/* Vertical Crosshair */}
                  <line
                    x1={getX(hoverIndex)}
                    y1="0"
                    x2={getX(hoverIndex)}
                    y2={totalSvgHeight}
                    stroke="#787b86"
                    strokeDasharray="3,3"
                    strokeWidth="1"
                  />
                  {/* Horizontal Crosshair */}
                  <line
                    x1="0"
                    y1={getY(activeCandle.close)}
                    x2={svgWidth - 60}
                    y2={getY(activeCandle.close)}
                    stroke="#787b86"
                    strokeDasharray="3,3"
                    strokeWidth="1"
                  />
                  {/* Price Tag Pill */}
                  <rect
                    x={svgWidth - 60}
                    y={getY(activeCandle.close) - 9}
                    width="56"
                    height="18"
                    fill="#2962ff"
                    rx="2"
                  />
                  <text
                    x={svgWidth - 32}
                    y={getY(activeCandle.close) + 3}
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {activeCandle.close.toFixed(selectedAsset.price < 5 ? 3 : 2)}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right (1 column): Analysis & Simulated Order Workstation */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 flex flex-col justify-between space-y-4">
          {/* Tab switcher: Technicals / Order Book / Trade */}
          <div className="flex items-center gap-1 bg-[#131722] p-1 rounded-md border border-[#2a2e39] text-xs">
            <button
              onClick={() => setSidebarTab('technicals')}
              className={`flex-1 py-1 font-semibold rounded transition-colors cursor-pointer text-center ${
                sidebarTab === 'technicals' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Technicals
            </button>
            <button
              onClick={() => setSidebarTab('orderbook')}
              className={`flex-1 py-1 font-semibold rounded transition-colors cursor-pointer text-center ${
                sidebarTab === 'orderbook' ? 'bg-[#2a2e39] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Depth (DOM)
            </button>
            <button
              onClick={() => setSidebarTab('trade')}
              className={`flex-1 py-1 font-semibold rounded transition-colors cursor-pointer text-center ${
                sidebarTab === 'trade' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Trade
            </button>
          </div>

          {/* Tab 1: Technical Analysis Gauge */}
          {sidebarTab === 'technicals' && (
            <div className="space-y-4">
              <TechnicalRatingGauge
                rating={selectedAsset.rating}
                oscillators={selectedAsset.technicals?.oscillators}
                movingAverages={selectedAsset.technicals?.movingAverages}
              />

              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded text-xs space-y-2">
                <div className="text-[#787b86] font-medium uppercase text-[10px] tracking-wider">
                  Summary Statistics
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9598a1]">24h High</span>
                  <span className="font-mono text-white font-medium">
                    ${selectedAsset.high24h.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9598a1]">24h Low</span>
                  <span className="font-mono text-white font-medium">
                    ${selectedAsset.low24h.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9598a1]">Volume</span>
                  <span className="font-mono text-white font-medium">{selectedAsset.volume}</span>
                </div>
                {selectedAsset.marketCap && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#9598a1]">Market Cap</span>
                    <span className="font-mono text-white font-medium">{selectedAsset.marketCap}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Depth of Market / Order Book */}
          {sidebarTab === 'orderbook' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#787b86] px-1 font-mono">
                <span>Price (USD)</span>
                <span>Size</span>
                <span>Total</span>
              </div>

              {/* Asks (Red) */}
              <div className="space-y-1">
                {orderBook.asks.slice(0, 5).reverse().map((ask, i) => (
                  <div
                    key={`ask-${i}`}
                    className="flex items-center justify-between text-xs font-mono relative py-0.5 px-1 hover:bg-[#2a2e39]/40"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#f23645]/15 pointer-events-none"
                      style={{ width: `${Math.min(100, (ask.total / 180) * 100)}%` }}
                    />
                    <span className="text-[#f23645] font-semibold">{ask.price.toFixed(2)}</span>
                    <span className="text-[#d1d4dc]">{ask.size.toFixed(2)}</span>
                    <span className="text-[#787b86]">{ask.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              {/* Current Spread Bar */}
              <div className="py-1.5 px-2 bg-[#131722] border-y border-[#2a2e39] text-center font-mono text-xs font-bold text-white flex items-center justify-between">
                <span className="text-[#787b86] text-[10px]">SPREAD 0.04</span>
                <span>${selectedAsset.price.toFixed(2)}</span>
                <span className="text-[#089981] text-[10px]">MARKET</span>
              </div>

              {/* Bids (Green) */}
              <div className="space-y-1">
                {orderBook.bids.slice(0, 5).map((bid, i) => (
                  <div
                    key={`bid-${i}`}
                    className="flex items-center justify-between text-xs font-mono relative py-0.5 px-1 hover:bg-[#2a2e39]/40"
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 bg-[#089981]/15 pointer-events-none"
                      style={{ width: `${Math.min(100, (bid.total / 180) * 100)}%` }}
                    />
                    <span className="text-[#089981] font-semibold">{bid.price.toFixed(2)}</span>
                    <span className="text-[#d1d4dc]">{bid.size.toFixed(2)}</span>
                    <span className="text-[#787b86]">{bid.total.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Paper Trade Simulator */}
          {sidebarTab === 'trade' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#787b86]">
                  <span>Available Balance</span>
                  <span className="font-mono text-white font-bold">
                    ${paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {currentPosition && (
                  <div className="flex items-center justify-between text-[#787b86] pt-1 border-t border-[#2a2e39]">
                    <span>Current Position</span>
                    <span className="font-mono text-[#089981] font-semibold">
                      {currentPosition.shares} shares @ ${currentPosition.entryPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[#787b86] font-medium">Quantity (Units / Shares)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={tradeShares}
                    onChange={(e) => setTradeShares(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#2962ff]"
                  />
                  <div className="flex gap-1">
                    {[1, 10, 50].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => setTradeShares(qty)}
                        className="px-2 py-1 bg-[#131722] hover:bg-[#2a2e39] text-[#787b86] hover:text-white rounded text-xs font-mono border border-[#2a2e39]"
                      >
                        {qty}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-[#787b86] font-mono">
                  Est. Order Value: ${(tradeShares * selectedAsset.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleBuy}
                  className="py-2.5 bg-[#089981] hover:bg-[#078873] text-white font-bold rounded text-xs transition-colors cursor-pointer shadow"
                >
                  BUY / LONG
                </button>
                <button
                  onClick={handleSell}
                  className="py-2.5 bg-[#f23645] hover:bg-[#d92d3b] text-white font-bold rounded text-xs transition-colors cursor-pointer shadow"
                >
                  SELL / SHORT
                </button>
              </div>

              {currentPosition && (
                <button
                  onClick={() => closePaperPosition(selectedAsset.symbol)}
                  className="w-full py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white rounded text-xs font-medium transition-colors cursor-pointer"
                >
                  Close Position ({currentPosition.shares} shares)
                </button>
              )}

              {tradeStatus && (
                <div className="p-2 rounded bg-[#2962ff]/10 border border-[#2962ff]/30 text-xs text-[#2962ff] font-medium text-center">
                  {tradeStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
