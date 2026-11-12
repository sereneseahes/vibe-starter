import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { MarketAsset } from '../../types/market';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const { assets, selectAsset, setActiveScreen } = useMarket();

  // Focus tickers for tape
  const tapeSymbols = ['SPX', 'NDX', 'DJI', 'BTCUSD', 'ETHUSD', 'NVDA', 'AAPL', 'TSLA', 'XAUUSD', 'USOIL', 'EURUSD', 'US10Y'];
  const tapeAssets = tapeSymbols
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean) as MarketAsset[];

  const handleTickerClick = (asset: MarketAsset) => {
    selectAsset(asset);
    setActiveScreen('chart');
  };

  // Duplicate items for continuous marquee loop
  const displayItems = [...tapeAssets, ...tapeAssets];

  return (
    <div className="relative w-full bg-[#1e222d] border-b border-[#2a2e39] overflow-hidden py-1.5 text-xs select-none">
      <div className="flex animate-ticker whitespace-nowrap">
        {displayItems.map((item, index) => {
          const isUp = item.change >= 0;
          return (
            <button
              key={`${item.symbol}-${index}`}
              onClick={() => handleTickerClick(item)}
              className={`inline-flex items-center gap-2.5 px-4 py-0.5 border-r border-[#2a2e39] hover:bg-[#2a2e39]/60 transition-colors cursor-pointer group ${
                item.flash === 'up' ? 'flash-up' : item.flash === 'down' ? 'flash-down' : ''
              }`}
            >
              <span className="font-semibold text-white tracking-tight group-hover:text-[#2962ff] transition-colors">
                {item.symbol}
              </span>

              <span className="font-mono tabular-nums text-[#d1d4dc]">
                {item.category === 'forex' || item.price < 5
                  ? item.price.toFixed(item.category === 'forex' ? 4 : 3)
                  : item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {item.currency === '%' ? '%' : ''}
              </span>

              <span
                className={`inline-flex items-center gap-0.5 font-mono tabular-nums text-[11px] font-medium ${
                  isUp ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                )}
                {isUp ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
