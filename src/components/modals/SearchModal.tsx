import React, { useState, useEffect, useMemo } from 'react';
import { useMarket } from '../../context/MarketContext';
import { MarketCategory, MarketAsset } from '../../types/market';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { assets, searchModalOpen, setSearchModalOpen, selectAsset, setActiveScreen } = useMarket();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  // Keyboard shortcut listener (Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      } else if (e.key === '/' && !searchModalOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSearchModalOpen(true);
        }
      } else if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  const filtered = useMemo(() => {
    return assets.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return item.symbol.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
    });
  }, [assets, query, category]);

  if (!searchModalOpen) return null;

  const handleSelect = (asset: MarketAsset) => {
    selectAsset(asset);
    setActiveScreen('chart');
    setSearchModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-[#1e222d] border border-[#2a2e39] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2a2e39]">
          <Search className="w-5 h-5 text-[#787b86]" />
          <input
            type="text"
            autoFocus
            placeholder="Search all global markets, tickers, crypto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-[#787b86] text-sm focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#787b86] hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchModalOpen(false)}
            className="px-2 py-1 text-xs text-[#787b86] hover:text-white bg-[#131722] rounded border border-[#2a2e39]"
          >
            ESC
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#171b26] border-b border-[#2a2e39] overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'forex', label: 'Forex' },
            { id: 'indices', label: 'Indices' },
            { id: 'futures', label: 'Futures' },
            { id: 'bonds', label: 'Bonds' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                category === cat.id ? 'bg-[#2962ff] text-white font-medium' : 'text-[#787b86] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#2a2e39] p-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[#787b86] text-xs">
              No symbols found matching &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => {
              const isUp = item.change >= 0;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[#2a2e39] transition-colors cursor-pointer group rounded"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: item.logoBg || '#2962ff' }}
                    >
                      {item.logoText || item.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors text-sm">
                          {item.symbol}
                        </span>
                        <span className="text-[10px] text-[#787b86] px-1.5 py-0.5 bg-[#131722] rounded font-mono">
                          {item.exchange}
                        </span>
                        <span className="text-xs text-[#787b86]">{item.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-mono text-sm font-bold text-white">
                        ${item.price >= 10 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(4)}
                      </div>
                      <div
                        className={`font-mono text-xs font-medium ${
                          isUp ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {item.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-[#787b86] group-hover:text-[#2962ff] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
