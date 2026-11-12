import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { CURRENCY_CROSS_RATES } from '../../data/mockMarketData';
import { MiniSparkline } from '../common/MiniSparkline';
import { TechnicalRatingGauge } from '../common/TechnicalRatingGauge';
import { Plus, Check, TrendingUp, RefreshCw } from 'lucide-react';

export const ForexScreen: React.FC = () => {
  const { assets, selectAsset, setActiveScreen, toggleWatchlist, isInWatchlist, openDetailModal } = useMarket();

  const forexAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'forex');
  }, [assets]);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'];

  const handleCrossClick = (base: string, quote: string) => {
    if (base === quote) return;
    const directSymbol = `${base}${quote}`;
    const inverseSymbol = `${quote}${base}`;
    const found = assets.find((a) => a.symbol === directSymbol || a.symbol === inverseSymbol);
    if (found) {
      selectAsset(found);
      setActiveScreen('chart');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Forex Rates & Currency Crosses
        </h1>
        <div className="text-xs text-[#787b86] mt-0.5">
          Global FX liquidity, real-time bid/ask quotes, and multi-currency cross matrix
        </div>
      </div>

      {/* 2. Currency Cross Rates Matrix */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2e39] mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-[#2962ff]" />
            <h2 className="text-base font-bold text-white tracking-tight">Currency Cross Rates Matrix</h2>
          </div>
          <span className="text-xs text-[#787b86]">Click any cross to inspect pair</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2a2e39] text-[#787b86]">
                <th className="py-2.5 px-3 text-left font-sans font-medium text-white">Base \ Quote</th>
                {currencies.map((c) => (
                  <th key={c} className="py-2.5 px-3 font-semibold text-white">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {CURRENCY_CROSS_RATES.map((row) => (
                <tr key={row.base} className="hover:bg-[#2a2e39]/30 transition-colors">
                  <td className="py-3 px-3 text-left font-sans font-bold text-white border-r border-[#2a2e39]">
                    {row.base}
                  </td>
                  {currencies.map((quote) => {
                    const isDiagonal = row.base === quote;
                    const rate = row.rates[quote];
                    return (
                      <td
                        key={quote}
                        onClick={() => handleCrossClick(row.base, quote)}
                        className={`py-3 px-3 tabular-nums transition-colors ${
                          isDiagonal
                            ? 'bg-[#131722] text-[#787b86]'
                            : 'cursor-pointer hover:bg-[#2962ff]/20 text-white font-medium'
                        }`}
                        title={isDiagonal ? 'Identity' : `View ${row.base}/${quote}`}
                      >
                        {isDiagonal ? '1.0000' : rate ? (rate < 1 ? rate.toFixed(4) : rate.toFixed(2)) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Major Forex Pairs Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2a2e39] bg-[#171b26] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Major & Minor Pairs</h2>
          <span className="text-xs text-[#787b86] font-mono">Real-time spreads</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#787b86] border-b border-[#2a2e39]">
                <th className="py-3 px-4 font-medium">Pair</th>
                <th className="py-3 px-3 font-medium text-right">Bid / Last</th>
                <th className="py-3 px-3 font-medium text-right">Pip Change</th>
                <th className="py-3 px-3 font-medium text-right">24h Change %</th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">24h High</th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">24h Low</th>
                <th className="py-3 px-3 font-medium text-center hidden md:table-cell">Technical Rating</th>
                <th className="py-3 px-3 font-medium text-center hidden lg:table-cell">Intraday Trend</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {forexAssets.map((pair) => {
                const isUp = pair.change >= 0;
                const inWatch = isInWatchlist(pair.symbol);
                return (
                  <tr
                    key={pair.id}
                    className={`hover:bg-[#2a2e39]/50 transition-colors cursor-pointer group ${
                      pair.flash === 'up' ? 'flash-up' : pair.flash === 'down' ? 'flash-down' : ''
                    }`}
                    onClick={() => openDetailModal(pair)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                          style={{ backgroundColor: pair.logoBg || '#2962ff' }}
                        >
                          {pair.logoText || pair.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {pair.symbol}
                          </div>
                          <div className="text-[11px] text-[#787b86]">{pair.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-white text-sm">
                      {pair.price.toFixed(4)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc]">
                      {isUp ? '+' : ''}
                      {(pair.change * 10000).toFixed(1)} pips
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                          isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {pair.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden sm:table-cell">
                      {pair.high24h.toFixed(4)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden sm:table-cell">
                      {pair.low24h.toFixed(4)}
                    </td>

                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <TechnicalRatingGauge rating={pair.rating} compact />
                    </td>

                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <MiniSparkline data={pair.sparkline} isPositive={isUp} width={70} height={20} />
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleWatchlist(pair.symbol)}
                          className={`p-1.5 rounded transition-colors ${
                            inWatch ? 'text-[#2962ff] bg-[#2962ff]/10' : 'text-[#787b86] hover:text-white'
                          }`}
                          title={inWatch ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          {inWatch ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            selectAsset(pair);
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
