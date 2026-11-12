import React from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/common/Header';
import { TickerTape } from './components/common/TickerTape';
import { OverviewScreen } from './components/overview/OverviewScreen';
import { StocksScreen } from './components/stocks/StocksScreen';
import { CryptoScreen } from './components/crypto/CryptoScreen';
import { ForexScreen } from './components/forex/ForexScreen';
import { FuturesScreen } from './components/futures/FuturesScreen';
import { HeatmapScreen } from './components/heatmap/HeatmapScreen';
import { SuperChartScreen } from './components/chart/SuperChartScreen';
import { SearchModal } from './components/modals/SearchModal';
import { SymbolDetailModal } from './components/modals/SymbolDetailModal';
import { WatchlistDrawer } from './components/watchlist/WatchlistDrawer';
import { Bell, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeScreen, alertToast, clearAlertToast } = useMarket();

  return (
    <div className="min-h-screen bg-[#131722] text-[#d1d4dc] flex flex-col font-sans selection:bg-[#2962ff]/30 selection:text-white">
      {/* 1. Global Navigation Top Bar */}
      <Header />

      {/* 2. Real-time Scrolling Ticker Tape */}
      <TickerTape />

      {/* 3. Global Notification Toast (Alerts & Trade Orders) */}
      {alertToast && (
        <div className="sticky top-[58px] z-30 bg-[#2962ff] text-white px-4 py-2 flex items-center justify-between text-xs font-medium shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Bell className="w-4 h-4 shrink-0" />
            <span className="truncate">{alertToast}</span>
          </div>
          <button
            onClick={clearAlertToast}
            className="p-1 hover:bg-white/20 rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Main Viewport Content Canvas (1440px Desktop Baseline) */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
        {activeScreen === 'overview' && <OverviewScreen />}
        {activeScreen === 'stocks' && <StocksScreen />}
        {activeScreen === 'crypto' && <CryptoScreen />}
        {activeScreen === 'forex' && <ForexScreen />}
        {activeScreen === 'futures' && <FuturesScreen />}
        {activeScreen === 'heatmap' && <HeatmapScreen />}
        {activeScreen === 'chart' && <SuperChartScreen />}
      </main>

      {/* 5. Quiet Clean Footer */}
      <footer className="border-t border-[#2a2e39] bg-[#131722] py-6 px-6 text-xs text-[#787b86]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">TradingView Markets</span>
            <span>·</span>
            <span>Financial market data & real-time analytics</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Market quotes delayed where applicable</span>
            <span>·</span>
            <span>Terms & Disclosures</span>
          </div>
        </div>
      </footer>

      {/* Interactive Overlays */}
      <SearchModal />
      <SymbolDetailModal />
      <WatchlistDrawer />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <AppContent />
    </MarketProvider>
  );
}
