import React, { useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { MiniSparkline } from '../common/MiniSparkline';
import { TechnicalRatingGauge } from '../common/TechnicalRatingGauge';
import { Plus, Check, TrendingUp, Flame, Landmark, Activity } from 'lucide-react';

export const FuturesScreen: React.FC = () => {
  const { assets, selectAsset, setActiveScreen, toggleWatchlist, isInWatchlist, openDetailModal } = useMarket();

  const commodityAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'futures');
  }, [assets]);

  const bondAssets = useMemo(() => {
    return assets.filter((a) => a.category === 'bonds');
  }, [assets]);

  // Compute 10Y - 2Y yield curve spread
  const us10 = assets.find((a) => a.symbol === 'US10Y');
  const us02 = assets.find((a) => a.symbol === 'US02Y');
  const curveSpread = us10 && us02 ? (us10.price - us02.price) * 100 : 11.7;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Futures, Commodities & Sovereign Bonds
        </h1>
        <div className="text-xs text-[#787b86] mt-0.5">
          Global benchmark energy, precious metals, and sovereign yield curve spreads
        </div>
      </div>

      {/* 2. Sovereign Yield Curve Spread Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-[#787b86]">
            <span>US 10Y - 2Y Spread</span>
            <Activity className="w-3.5 h-3.5 text-[#2962ff]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            +{curveSpread.toFixed(1)} bps
          </div>
          <div className="text-xs text-[#089981] mt-0.5 font-medium">
            Positive Curve (Normal Expansion)
          </div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-[#787b86]">
            <span>Gold Safe Haven (XAU)</span>
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            $2,684.50
          </div>
          <div className="text-xs text-[#089981] mt-0.5 font-medium">
            +0.68% (Near All-Time Highs)
          </div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4">
          <div className="flex items-center justify-between text-xs text-[#787b86]">
            <span>Crude Oil WTI (USOIL)</span>
            <Flame className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            $68.95 / bbl
          </div>
          <div className="text-xs text-[#089981] mt-0.5 font-medium">
            +1.25% Daily Rebound
          </div>
        </div>
      </div>

      {/* 3. Commodities Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2a2e39] bg-[#171b26] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Commodity Contracts (Energy & Metals)</h2>
          <span className="text-xs text-[#787b86]">NYMEX & COMEX Real-Time</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#787b86] border-b border-[#2a2e39]">
                <th className="py-3 px-4 font-medium">Commodity</th>
                <th className="py-3 px-3 font-medium text-right">Last Price</th>
                <th className="py-3 px-3 font-medium text-right">Change</th>
                <th className="py-3 px-3 font-medium text-right">Change %</th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">24h High</th>
                <th className="py-3 px-3 font-medium text-right hidden sm:table-cell">24h Low</th>
                <th className="py-3 px-3 font-medium text-center hidden md:table-cell">Technical Rating</th>
                <th className="py-3 px-3 font-medium text-center hidden sm:table-cell">Intraday Trend</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {commodityAssets.map((item) => {
                const isUp = item.change >= 0;
                const inWatch = isInWatchlist(item.symbol);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#2a2e39]/50 transition-colors cursor-pointer group ${
                      item.flash === 'up' ? 'flash-up' : item.flash === 'down' ? 'flash-down' : ''
                    }`}
                    onClick={() => openDetailModal(item)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                          style={{ backgroundColor: item.logoBg || '#2962ff' }}
                        >
                          {item.logoText || item.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {item.symbol}
                          </div>
                          <div className="text-[11px] text-[#787b86]">{item.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-white text-sm">
                      ${item.price >= 10 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(3)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc]">
                      {isUp ? '+' : ''}
                      {item.change.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                          isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden sm:table-cell">
                      {item.high24h.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#787b86] hidden sm:table-cell">
                      {item.low24h.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <TechnicalRatingGauge rating={item.rating} compact />
                    </td>

                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <MiniSparkline data={item.sparkline} isPositive={isUp} width={70} height={20} />
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
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

      {/* 4. Sovereign Bond Yields Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-[#2a2e39] bg-[#171b26] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Sovereign Debt Benchmark Yields</h2>
          <span className="text-xs text-[#787b86]">US, Germany & Japan Tenors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#787b86] border-b border-[#2a2e39]">
                <th className="py-3 px-4 font-medium">Tenor / Issue</th>
                <th className="py-3 px-3 font-medium text-right">Yield</th>
                <th className="py-3 px-3 font-medium text-right">Change (bps)</th>
                <th className="py-3 px-3 font-medium text-right">Change %</th>
                <th className="py-3 px-3 font-medium text-center hidden md:table-cell">Technical Rating</th>
                <th className="py-3 px-3 font-medium text-center hidden sm:table-cell">Trend</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]">
              {bondAssets.map((bond) => {
                const isUp = bond.change >= 0;
                const inWatch = isInWatchlist(bond.symbol);
                return (
                  <tr
                    key={bond.id}
                    className={`hover:bg-[#2a2e39]/50 transition-colors cursor-pointer group ${
                      bond.flash === 'up' ? 'flash-up' : bond.flash === 'down' ? 'flash-down' : ''
                    }`}
                    onClick={() => openDetailModal(bond)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                          style={{ backgroundColor: bond.logoBg || '#455a64' }}
                        >
                          {bond.logoText || bond.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors">
                            {bond.symbol}
                          </div>
                          <div className="text-[11px] text-[#787b86]">{bond.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-white text-sm">
                      {bond.price.toFixed(3)}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#d1d4dc]">
                      {isUp ? '+' : ''}
                      {(bond.change * 100).toFixed(1)} bps
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] ${
                          isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {bond.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center hidden md:table-cell">
                      <TechnicalRatingGauge rating={bond.rating} compact />
                    </td>

                    <td className="py-3 px-3 text-center hidden sm:table-cell">
                      <MiniSparkline data={bond.sparkline} isPositive={isUp} width={65} height={20} />
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleWatchlist(bond.symbol)}
                          className={`p-1.5 rounded transition-colors ${
                            inWatch ? 'text-[#2962ff] bg-[#2962ff]/10' : 'text-[#787b86] hover:text-white'
                          }`}
                          title={inWatch ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          {inWatch ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            selectAsset(bond);
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
