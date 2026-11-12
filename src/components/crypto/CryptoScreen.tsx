import React, { useState, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { MiniSparkline } from '../common/MiniSparkline';
import { TechnicalRatingGauge } from '../common/TechnicalRatingGauge';
import { Plus, Check, TrendingUp, Flame, Zap, Shield, Search } from 'lucide-react';

export const CryptoScreen: React.FC = () => {
  const { assets, selectAsset, setActiveScreen, toggleWatchlist, isInWatchlist, openDetailModal } = useMarket();

  const [categoryFilter, setCategoryFilter] = useState<'all' | 'l1' | 'defi' | 'meme'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cryptoAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'crypto');
  }, [assets]);

  const filteredCryptos = useMemo(() => {
    return cryptoAssets.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!item.symbol.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter === 'meme' && item.symbol !== 'DOGEUSD') return false;
      if (categoryFilter === 'l1' && !['BTCUSD', 'ETHUSD', 'SOLUSD', 'BNBUSD'].includes(item.symbol)) return false;
      return true;
    });
  }, [cryptoAssets, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Global Crypto Stats */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Crypto Coins & Tokens Market
        </h1>
        <div className="text-xs text-[#787b86] mt-0.5">
          Real-time prices, volume, circulating market cap, and technical indicators
        </div>
      </div>

      {/* 2. Crypto Highlights Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="text-xs text-[#787b86]">Total Market Cap</div>
          <div className="text-xl font-bold font-mono text-white mt-1">$3.18T</div>
          <div className="text-xs text-[#089981] font-mono mt-0.5">+2.84% (24h)</div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="text-xs text-[#787b86]">24h Global Volume</div>
          <div className="text-xl font-bold font-mono text-white mt-1">$142.8B</div>
          <div className="text-xs text-[#787b86] font-mono mt-0.5">Across 420 exchanges</div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="text-xs text-[#787b86]">Bitcoin Dominance</div>
          <div className="text-xl font-bold font-mono text-white mt-1">58.4%</div>
          <div className="text-xs text-[#089981] font-mono mt-0.5">+0.32% this week</div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="text-xs text-[#787b86]">Fear & Greed Index</div>
          <div className="text-xl font-bold font-mono text-[#089981] mt-1">82 / 100</div>
          <div className="text-xs text-[#787b86] font-medium mt-0.5">Extreme Greed</div>
        </div>
      </div>

      {/* 3. Category Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Cryptos' },
            { id: 'l1', label: 'Layer 1' },
            { id: 'defi', label: 'DeFi' },
            { id: 'meme', label: 'Memes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#131722] text-[#787b86] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#787b86]" />
          <input
            type="text"
            placeholder="Search crypto symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131722] border border-[#2a2e39] rounded px-3 py-1.5 pl-8 text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
          />
        </div>
      </div>

      {/* 4. Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#787b86] border-b border-[#2a2e39] bg-[#171b26]">
                <th className="py-3 px-4 font-medium">Asset</th>
                <th className="py-3 px-3 font-medium text-right">Price (USD)</th>
                <th className="py-3 px-3 font-medium text-right">24h Change</th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">24h Volume</th>
                <th className="py-3 px-3 font-medium text-right hidden md:table-cell">Market Cap</th>
                <th className="py-3 px-3 font-medium text-center hidden lg:table-cell">Technical Rating</th>
                <th className="py-3 px-3 font-medium text-center hidden sm:table-cell">Last 7 Days</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {filteredCryptos.map((coin, index) => {
                const isUp = coin.change >= 0;
                const inWatch = isInWatchlist(coin.symbol);
                return (
                  <tr
                    key={coin.id}
                    className={`hover:bg-[#2a2e39]/50 transition-colors cursor-pointer group ${
                      coin.flash === 'up' ? 'flash-up' : coin.flash === 'down' ? 'flash-down' : ''
                    }`}
                    onClick={() => openDetailModal(coin)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-[#787b86] w-4">{index + 1}</span>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm"
                          style={{ backgroundColor: coin.logoBg || '#f7931a' }}
                        >
                          {coin.logoText || coin.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                              {coin.name}
                            </span>
                            <span className="text-[10px] text-[#787b86] font-mono">{coin.symbol}</span>
                          </div>
                          <div className="text-[11px] text-[#787b86] truncate max-w-[150px]">
                            {coin.description?.slice(0, 45)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-white text-sm">
                      ${coin.price >= 1 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(3)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                          isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {coin.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc] hidden sm:table-cell">
                      ${coin.volume}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-white font-medium hidden md:table-cell">
                      ${coin.marketCap}
                    </td>

                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <TechnicalRatingGauge rating={coin.rating} compact />
                    </td>

                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <MiniSparkline data={coin.sparkline} isPositive={isUp} width={75} height={22} />
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleWatchlist(coin.symbol)}
                          className={`p-1.5 rounded transition-colors ${
                            inWatch ? 'text-[#2962ff] bg-[#2962ff]/10' : 'text-[#787b86] hover:text-white'
                          }`}
                          title={inWatch ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          {inWatch ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            selectAsset(coin);
                            setActiveScreen('chart');
                          }}
                          className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39] transition-colors"
                          title="Open SuperChart"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-[#2962ff]" />
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
    </div>
  );
};
