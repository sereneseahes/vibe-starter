import React from 'react';
import { useMarket, ScreenType } from '../../context/MarketContext';
import { Search, Bookmark, Sun, Moon, Radio, TrendingUp } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    watchlist,
    theme,
    toggleTheme,
    isLiveSimulation,
    toggleLiveSimulation,
    setSearchModalOpen,
    setWatchlistDrawerOpen,
  } = useMarket();

  const navItems: { id: ScreenType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'futures', label: 'Futures' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'chart', label: 'SuperChart' },
  ];

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-5 py-2.5 bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] select-none">
      {/* Zone 1: Single Brand element */}
      <button
        onClick={() => setActiveScreen('overview')}
        className="flex items-center gap-2 text-base font-bold tracking-tight text-white hover:text-[#2962ff] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none cursor-pointer"
        aria-label="TradingView Markets Home"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded bg-[#2962ff] text-white font-extrabold text-sm tracking-tighter">
          TV
        </span>
        <span className="font-semibold text-lg tracking-tight text-[#f0f3fa]">TradingView</span>
        <span className="text-xs text-[#787b86] font-normal hidden sm:inline">Markets</span>
      </button>

      {/* Zone 2: Navigation Links (single line whitespace-nowrap) */}
      <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap shrink-0 text-xs font-semibold cursor-pointer ${
                isActive
                  ? 'text-white bg-[#2a2e39] shadow-inner'
                  : 'text-[#9598a1] hover:text-white hover:bg-[#1e222d]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Functional Actions Cluster */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Search Trigger */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1e222d] hover:bg-[#2a2e39] text-[#9598a1] hover:text-white border border-[#2a2e39] rounded text-xs transition-colors cursor-pointer"
          title="Search markets (Press / or Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#787b86]" />
          <span className="hidden sm:inline">Search symbol</span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#131722] text-[#787b86] rounded border border-[#2a2e39]">
            /
          </kbd>
        </button>

        {/* Live Simulation Switch */}
        <button
          onClick={toggleLiveSimulation}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
            isLiveSimulation
              ? 'bg-[#089981]/10 text-[#089981] border-[#089981]/30 hover:bg-[#089981]/20'
              : 'bg-[#1e222d] text-[#787b86] border-[#2a2e39] hover:text-[#d1d4dc]'
          }`}
          title={isLiveSimulation ? 'Live price ticks active (Click to pause)' : 'Price simulation paused (Click to resume)'}
        >
          <Radio className={`w-3 h-3 ${isLiveSimulation ? 'animate-pulse' : ''}`} />
          <span className="hidden xl:inline">{isLiveSimulation ? 'Live Ticks' : 'Paused'}</span>
        </button>

        {/* Watchlist Drawer Trigger */}
        <button
          onClick={() => setWatchlistDrawerOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1e222d] hover:bg-[#2a2e39] text-[#d1d4dc] border border-[#2a2e39] rounded text-xs font-medium transition-colors cursor-pointer"
          title="Open Watchlist & Alerts"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#2962ff]" />
          <span className="hidden md:inline">Watchlist</span>
          <span className="px-1 text-[11px] font-mono rounded bg-[#2a2e39] text-white">
            {watchlist.length}
          </span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-[#9598a1] hover:text-white hover:bg-[#1e222d] rounded transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* SuperChart Primary CTA */}
        <button
          onClick={() => setActiveScreen('chart')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Launch Chart</span>
        </button>
      </div>
    </header>
  );
};
