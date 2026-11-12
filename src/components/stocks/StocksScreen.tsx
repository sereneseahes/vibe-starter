import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { MiniSparkline } from '../common/MiniSparkline';
import { TechnicalRatingGauge } from '../common/TechnicalRatingGauge';
import { Search, Filter, Plus, Check, ExternalLink, ArrowUpDown, TrendingUp } from 'lucide-react';

export const StocksScreen: React.FC = () => {
  const { assets, selectAsset, setActiveScreen, toggleWatchlist, isInWatchlist, openDetailModal } = useMarket();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedCap, setSelectedCap] = useState<string>('All');
  const [selectedRating, setSelectedRating] = useState<string>('All');
  const [sortField, setSortField] = useState<'marketCapRaw' | 'changePercent' | 'price' | 'volumeRaw'>('marketCapRaw');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filter stocks
  const stockAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'stocks');
  }, [assets]);

  const sectors = useMemo(() => {
    const list = Array.from(new Set(stockAssets.map((s) => s.sector).filter(Boolean))) as string[];
    return ['All', ...list];
  }, [stockAssets]);

  const filteredStocks = useMemo(() => {
    return stockAssets.filter((item) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Sector
      if (selectedSector !== 'All' && item.sector !== selectedSector) return false;
      // Rating
      if (selectedRating !== 'All' && item.rating !== selectedRating) return false;
      // Market Cap
      if (selectedCap === 'Mega' && (item.marketCapRaw || 0) < 200000000000) return false;
      if (selectedCap === 'Large' && ((item.marketCapRaw || 0) >= 200000000000 || (item.marketCapRaw || 0) < 10000000000)) return false;

      return true;
    }).sort((a, b) => {
      let valA = a[sortField] || 0;
      let valB = b[sortField] || 0;
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [stockAssets, searchQuery, selectedSector, selectedRating, selectedCap, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Stock Screener & Performance
          </h1>
          <div className="text-xs text-[#787b86] mt-0.5">
            Institutional-grade multi-metric screening for leading global equities
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 bg-[#1e222d] border border-[#2a2e39] rounded text-[#d1d4dc]">
            <span className="text-[#787b86] mr-1.5">Listed:</span>
            <span className="font-mono font-bold text-white">{stockAssets.length} stocks</span>
          </div>
          <div className="px-3 py-1.5 bg-[#1e222d] border border-[#2a2e39] rounded text-[#d1d4dc]">
            <span className="text-[#787b86] mr-1.5">Advancing:</span>
            <span className="font-mono font-bold text-[#089981]">
              {stockAssets.filter((s) => s.change >= 0).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#787b86]" />
            <input
              type="text"
              placeholder="Search ticker, company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 pl-9 text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            {/* Sector */}
            <div className="flex items-center gap-1.5 text-xs text-[#787b86]">
              <Filter className="w-3.5 h-3.5" />
              <span>Sector:</span>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-[#131722] text-white border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2962ff] cursor-pointer"
              >
                {sectors.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Cap */}
            <div className="flex items-center gap-1.5 text-xs text-[#787b86]">
              <span>Cap:</span>
              <select
                value={selectedCap}
                onChange={(e) => setSelectedCap(e.target.value)}
                className="bg-[#131722] text-white border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2962ff] cursor-pointer"
              >
                <option value="All">All Caps</option>
                <option value="Mega">Mega Cap (&gt;$200B)</option>
                <option value="Large">Large Cap ($10B-$200B)</option>
              </select>
            </div>

            {/* Technical Rating */}
            <div className="flex items-center gap-1.5 text-xs text-[#787b86]">
              <span>Rating:</span>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="bg-[#131722] text-white border border-[#2a2e39] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#2962ff] cursor-pointer"
              >
                <option value="All">All Ratings</option>
                <option value="Strong Buy">Strong Buy</option>
                <option value="Buy">Buy</option>
                <option value="Neutral">Neutral</option>
                <option value="Sell">Sell</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Screener Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#787b86] border-b border-[#2a2e39] bg-[#171b26]">
                <th className="py-3 px-4 font-medium">Company</th>
                <th
                  className="py-3 px-3 font-medium text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('price')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Last</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  className="py-3 px-3 font-medium text-right cursor-pointer hover:text-white"
                  onClick={() => toggleSort('changePercent')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Change %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-medium text-center hidden md:table-cell">52W Range</th>
                <th
                  className="py-3 px-3 font-medium text-right cursor-pointer hover:text-white hidden lg:table-cell"
                  onClick={() => toggleSort('marketCapRaw')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Market Cap</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">P/E</th>
                <th className="py-3 px-3 font-medium text-center hidden xl:table-cell">Technical Rating</th>
                <th className="py-3 px-3 font-medium text-center hidden md:table-cell">Trend</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#2a2e39]">
              {filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#787b86]">
                    No stocks match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock) => {
                  const isUp = stock.change >= 0;
                  const inWatch = isInWatchlist(stock.symbol);

                  // 52-week position %
                  const rangePct =
                    stock.high52w && stock.low52w && stock.high52w > stock.low52w
                      ? Math.min(100, Math.max(0, ((stock.price - stock.low52w) / (stock.high52w - stock.low52w)) * 100))
                      : 50;

                  return (
                    <tr
                      key={stock.id}
                      className={`hover:bg-[#2a2e39]/50 transition-colors cursor-pointer group ${
                        stock.flash === 'up' ? 'flash-up' : stock.flash === 'down' ? 'flash-down' : ''
                      }`}
                      onClick={() => openDetailModal(stock)}
                    >
                      {/* Company Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-xs shrink-0"
                            style={{ backgroundColor: stock.logoBg || '#2962ff' }}
                          >
                            {stock.logoText || stock.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                                {stock.symbol}
                              </span>
                              <span className="text-[10px] text-[#787b86] px-1 bg-[#131722] rounded">
                                {stock.exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#787b86] truncate max-w-[160px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Last Price */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-white">
                        ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Change % */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                            isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* 52W Range Bar */}
                      <td className="py-3 px-3 hidden md:table-cell">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-28 bg-[#131722] h-1.5 rounded-full overflow-hidden relative">
                            <div
                              className="h-full bg-[#2962ff] rounded-full"
                              style={{ width: `${rangePct}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between w-28 text-[9px] text-[#787b86] font-mono">
                            <span>${stock.low52w?.toFixed(0)}</span>
                            <span>${stock.high52w?.toFixed(0)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Market Cap */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc] hidden lg:table-cell">
                        {stock.marketCap}
                      </td>

                      {/* P/E Ratio */}
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden sm:table-cell">
                        {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                      </td>

                      {/* Technical Rating */}
                      <td className="py-3 px-3 text-center hidden xl:table-cell">
                        <TechnicalRatingGauge rating={stock.rating} compact />
                      </td>

                      {/* Trend Sparkline */}
                      <td className="py-3 px-3 text-center hidden md:table-cell">
                        <MiniSparkline data={stock.sparkline} isPositive={isUp} width={65} height={20} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className={`p-1.5 rounded transition-colors ${
                              inWatch ? 'text-[#2962ff] bg-[#2962ff]/10' : 'text-[#787b86] hover:text-white'
                            }`}
                            title={inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          >
                            {inWatch ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => {
                              selectAsset(stock);
                              setActiveScreen('chart');
                            }}
                            className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39] transition-colors"
                            title="Open in SuperChart"
                          >
                            <TrendingUp className="w-3.5 h-3.5 text-[#2962ff]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
