import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { MarketAsset } from '../../types/market';
import { TrendingUp, Layers, ZoomIn } from 'lucide-react';

interface HeatmapTile {
  asset: MarketAsset;
  weight: number;
  color: string;
}

export const HeatmapScreen: React.FC = () => {
  const { assets, selectAsset, setActiveScreen, openDetailModal } = useMarket();

  const [activeSector, setActiveSector] = useState<string>('All');
  const [metric, setMetric] = useState<'marketCap' | 'volume'>('marketCap');
  const [hoveredAsset, setHoveredAsset] = useState<MarketAsset | null>(null);

  const stockAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'stocks');
  }, [assets]);

  // Group by sector
  const sectors = useMemo(() => {
    const list = Array.from(new Set(stockAssets.map((s) => s.sector).filter(Boolean))) as string[];
    return ['All', ...list];
  }, [stockAssets]);

  const displayedAssets = useMemo(() => {
    if (activeSector === 'All') return stockAssets;
    return stockAssets.filter((s) => s.sector === activeSector);
  }, [stockAssets, activeSector]);

  // Color mapper based on TradingView standard heatmap
  const getHeatmapColor = (changePct: number) => {
    if (changePct >= 4) return '#089981'; // rich deep green
    if (changePct >= 2) return '#26a69a'; // medium green
    if (changePct >= 0.5) return '#2e7d32'; // soft green
    if (changePct >= 0) return '#1b5e20'; // dark green
    if (changePct > -1) return '#7f1d1d'; // dark red
    if (changePct > -3) return '#b91c1c'; // medium red
    return '#f23645'; // bright deep red
  };

  // Group assets by sector for sector container boxes
  const sectorGroups = useMemo(() => {
    const map = new Map<string, MarketAsset[]>();
    displayedAssets.forEach((asset) => {
      const sec = asset.sector || 'Other';
      if (!map.has(sec)) map.set(sec, []);
      map.get(sec)!.push(asset);
    });
    return Array.from(map.entries());
  }, [displayedAssets]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            S&P 500 Market Heatmap
          </h1>
          <div className="text-xs text-[#787b86] mt-0.5">
            Tree-map visual representation weighted by market capitalization and 1-day returns
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Sector Filters */}
          <div className="flex items-center gap-1 bg-[#1e222d] p-1 rounded-md border border-[#2a2e39] text-xs">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSector(sec)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeSector === sec ? 'bg-[#2a2e39] text-white font-semibold' : 'text-[#787b86] hover:text-[#d1d4dc]'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Metric Filter */}
          <div className="flex items-center gap-1 bg-[#1e222d] p-1 rounded-md border border-[#2a2e39] text-xs">
            <button
              onClick={() => setMetric('marketCap')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                metric === 'marketCap' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setMetric('volume')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                metric === 'volume' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* 2. Color Legend */}
      <div className="flex items-center justify-between p-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg text-xs">
        <div className="flex items-center gap-2 text-[#787b86]">
          <Layers className="w-3.5 h-3.5 text-[#2962ff]" />
          <span>Performance Scale (1-Day):</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-[#f23645] text-white">&lt;-3%</span>
          <span className="px-2 py-0.5 rounded bg-[#b91c1c] text-white">-2%</span>
          <span className="px-2 py-0.5 rounded bg-[#7f1d1d] text-white">-0.5%</span>
          <span className="px-2 py-0.5 rounded bg-[#2a2e39] text-[#787b86]">0%</span>
          <span className="px-2 py-0.5 rounded bg-[#1b5e20] text-white">+0.5%</span>
          <span className="px-2 py-0.5 rounded bg-[#26a69a] text-white">+2%</span>
          <span className="px-2 py-0.5 rounded bg-[#089981] text-white">&gt;+3%</span>
        </div>
      </div>

      {/* 3. Interactive Visual Tree Map Grid */}
      <div className="relative bg-[#131722] border border-[#2a2e39] rounded-lg p-3 min-h-[580px] select-none">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectorGroups.map(([sectorName, items]) => {
            return (
              <div
                key={sectorName}
                className="bg-[#171b26] border border-[#2a2e39] rounded-lg p-2.5 flex flex-col"
              >
                <div className="flex items-center justify-between text-xs text-[#9598a1] font-semibold mb-2 px-1">
                  <span>{sectorName}</span>
                  <span className="text-[10px] text-[#787b86] font-mono">
                    {items.length} stocks
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-[160px]">
                  {items.map((stock) => {
                    const isUp = stock.change >= 0;
                    const tileColor = getHeatmapColor(stock.changePercent);
                    const isGiant = ['NVDA', 'AAPL', 'MSFT', 'AMZN', 'TSLA'].includes(stock.symbol);

                    return (
                      <div
                        key={stock.id}
                        onMouseEnter={() => setHoveredAsset(stock)}
                        onMouseLeave={() => setHoveredAsset(null)}
                        onClick={() => {
                          selectAsset(stock);
                          setActiveScreen('chart');
                        }}
                        className={`relative rounded p-3 transition-transform hover:scale-[1.02] hover:z-10 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm ${
                          isGiant ? 'col-span-2 min-h-[110px]' : 'min-h-[85px]'
                        }`}
                        style={{ backgroundColor: tileColor }}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-extrabold text-white text-base tracking-tight drop-shadow-sm">
                            {stock.symbol}
                          </span>
                          <span className="text-white/80 font-mono text-[11px] font-medium drop-shadow-sm">
                            ${stock.price >= 10 ? stock.price.toFixed(1) : stock.price.toFixed(2)}
                          </span>
                        </div>

                        <div>
                          <div className="text-white font-mono font-bold text-sm sm:text-base drop-shadow-sm">
                            {isUp ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                          </div>
                          <div className="text-white/70 text-[10px] truncate max-w-full font-medium">
                            {stock.marketCap} · {stock.name}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover Inspector Tooltip Floating Bar */}
        {hoveredAsset && (
          <div className="sticky bottom-4 left-4 right-4 mt-4 p-3 bg-[#1e222d] border border-[#2962ff] shadow-xl rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-xs"
                style={{ backgroundColor: hoveredAsset.logoBg || '#2962ff' }}
              >
                {hoveredAsset.logoText || hoveredAsset.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{hoveredAsset.symbol}</span>
                  <span className="text-[#787b86]">{hoveredAsset.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#131722] text-[#2962ff] font-mono text-[10px]">
                    {hoveredAsset.sector}
                  </span>
                </div>
                <div className="text-[#d1d4dc] text-[11px]">
                  Market Cap: <span className="font-mono text-white">{hoveredAsset.marketCap}</span> · P/E:{' '}
                  <span className="font-mono text-white">{hoveredAsset.peRatio || '—'}</span> · 24h Vol:{' '}
                  <span className="font-mono text-white">{hoveredAsset.volume}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-sm font-bold font-mono text-white">
                  ${hoveredAsset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div
                  className={`font-mono text-xs font-semibold ${
                    hoveredAsset.change >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {hoveredAsset.change >= 0 ? '+' : ''}
                  {hoveredAsset.changePercent.toFixed(2)}%
                </div>
              </div>

              <button
                onClick={() => {
                  selectAsset(hoveredAsset);
                  setActiveScreen('chart');
                }}
                className="px-3 py-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>SuperChart</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
