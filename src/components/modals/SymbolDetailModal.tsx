import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { MiniSparkline } from '../common/MiniSparkline';
import { TechnicalRatingGauge } from '../common/TechnicalRatingGauge';
import { X, TrendingUp, Bookmark, Check, Bell, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

export const SymbolDetailModal: React.FC = () => {
  const {
    detailModalAsset,
    closeDetailModal,
    selectAsset,
    setActiveScreen,
    toggleWatchlist,
    isInWatchlist,
    addAlert,
  } = useMarket();

  if (!detailModalAsset) return null;

  const asset = detailModalAsset;
  const isUp = asset.change >= 0;
  const inWatch = isInWatchlist(asset.symbol);

  const handleLaunchChart = () => {
    selectAsset(asset);
    setActiveScreen('chart');
    closeDetailModal();
  };

  const handleSetAlert = () => {
    addAlert(asset.symbol, Number((asset.price * 1.05).toFixed(2)), 'above');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="w-full max-w-xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2a2e39]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ backgroundColor: asset.logoBg || '#2962ff' }}
            >
              {asset.logoText || asset.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{asset.symbol}</h2>
                <span className="text-xs px-2 py-0.5 bg-[#131722] text-[#787b86] rounded font-mono">
                  {asset.exchange}
                </span>
                <span className="text-xs px-2 py-0.5 bg-[#131722] text-[#2962ff] rounded capitalize">
                  {asset.category}
                </span>
              </div>
              <div className="text-xs text-[#787b86]">{asset.name}</div>
            </div>
          </div>

          <button
            onClick={closeDetailModal}
            className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Price & Change Banner */}
          <div className="flex items-baseline justify-between p-4 bg-[#131722] rounded-lg border border-[#2a2e39]">
            <div>
              <div className="text-xs text-[#787b86]">Current Market Price</div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
                ${asset.price >= 10 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(4)}
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-flex items-center gap-1 font-mono text-sm font-semibold px-2 py-1 rounded ${
                  isUp ? 'text-[#089981] bg-[#089981]/10' : 'text-[#f23645] bg-[#f23645]/10'
                }`}
              >
                {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {isUp ? '+' : ''}
                {asset.change.toFixed(2)} ({isUp ? '+' : ''}
                {asset.changePercent.toFixed(2)}%)
              </span>
              <div className="text-[11px] text-[#787b86] mt-1 font-mono">Prev Close: ${asset.previousClose.toFixed(2)}</div>
            </div>
          </div>

          {/* Sparkline Visual */}
          <div className="p-4 bg-[#131722] rounded-lg border border-[#2a2e39] flex items-center justify-between">
            <div>
              <div className="text-xs text-[#787b86]">Intraday Performance</div>
              <div className="text-xs text-white font-medium mt-1">
                High: ${asset.high24h.toLocaleString()} · Low: ${asset.low24h.toLocaleString()}
              </div>
            </div>
            <MiniSparkline data={asset.sparkline} isPositive={isUp} width={130} height={36} />
          </div>

          {/* Fundamentals Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded">
              <div className="text-[#787b86]">Volume</div>
              <div className="text-white font-mono font-semibold mt-1">{asset.volume}</div>
            </div>

            {asset.marketCap && (
              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded">
                <div className="text-[#787b86]">Market Cap</div>
                <div className="text-white font-mono font-semibold mt-1">{asset.marketCap}</div>
              </div>
            )}

            {asset.peRatio && (
              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded">
                <div className="text-[#787b86]">P/E Ratio</div>
                <div className="text-white font-mono font-semibold mt-1">{asset.peRatio.toFixed(1)}</div>
              </div>
            )}

            {asset.eps && (
              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded">
                <div className="text-[#787b86]">EPS (TTM)</div>
                <div className="text-white font-mono font-semibold mt-1">${asset.eps.toFixed(2)}</div>
              </div>
            )}

            {asset.high52w && (
              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded">
                <div className="text-[#787b86]">52-Week High</div>
                <div className="text-white font-mono font-semibold mt-1">${asset.high52w.toFixed(2)}</div>
              </div>
            )}

            {asset.low52w && (
              <div className="p-3 bg-[#131722] border border-[#2a2e39] rounded">
                <div className="text-[#787b86]">52-Week Low</div>
                <div className="text-white font-mono font-semibold mt-1">${asset.low52w.toFixed(2)}</div>
              </div>
            )}
          </div>

          {/* Technical Analysis Gauge */}
          <TechnicalRatingGauge
            rating={asset.rating}
            oscillators={asset.technicals?.oscillators}
            movingAverages={asset.technicals?.movingAverages}
          />

          {/* Description */}
          {asset.description && (
            <div className="text-xs text-[#9598a1] leading-relaxed pt-2 border-t border-[#2a2e39]">
              {asset.description}
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="flex items-center justify-between p-4 bg-[#171b26] border-t border-[#2a2e39] gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWatchlist(asset.symbol)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium border transition-colors cursor-pointer ${
                inWatch
                  ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                  : 'bg-[#1e222d] text-[#d1d4dc] border-[#2a2e39] hover:text-white'
              }`}
            >
              {inWatch ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{inWatch ? 'In Watchlist' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={handleSetAlert}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] border border-[#2a2e39] rounded text-xs font-medium transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Set Alert</span>
            </button>
          </div>

          <button
            onClick={handleLaunchChart}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Open in SuperChart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
