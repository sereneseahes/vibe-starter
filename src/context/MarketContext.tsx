import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MarketAsset, PriceAlert, PaperTradePosition } from '../types/market';
import { INITIAL_ASSETS } from '../data/mockMarketData';

export type ScreenType = 'overview' | 'stocks' | 'crypto' | 'forex' | 'futures' | 'heatmap' | 'chart';

interface MarketContextType {
  assets: MarketAsset[];
  selectedAsset: MarketAsset;
  activeScreen: ScreenType;
  watchlist: string[];
  alerts: PriceAlert[];
  alertToast: string | null;
  isLiveSimulation: boolean;
  theme: 'dark' | 'light';
  searchModalOpen: boolean;
  watchlistDrawerOpen: boolean;
  detailModalAsset: MarketAsset | null;
  paperBalance: number;
  paperPositions: PaperTradePosition[];
  // Actions
  selectAsset: (symbolOrAsset: string | MarketAsset) => void;
  setActiveScreen: (screen: ScreenType) => void;
  toggleWatchlist: (symbol: string) => void;
  isInWatchlist: (symbol: string) => boolean;
  addAlert: (symbol: string, targetPrice: number, condition: 'above' | 'below') => void;
  removeAlert: (id: string) => void;
  toggleLiveSimulation: () => void;
  toggleTheme: () => void;
  setSearchModalOpen: (open: boolean) => void;
  setWatchlistDrawerOpen: (open: boolean) => void;
  openDetailModal: (asset: MarketAsset) => void;
  closeDetailModal: () => void;
  clearAlertToast: () => void;
  executePaperTrade: (symbol: string, type: 'BUY' | 'SELL', shares: number) => { success: boolean; message: string };
  closePaperPosition: (symbol: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset>(INITIAL_ASSETS[0]);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('overview');
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tv_watchlist');
      return saved ? JSON.parse(saved) : ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD'];
    } catch {
      return ['SPX', 'NVDA', 'AAPL', 'BTCUSD', 'XAUUSD'];
    }
  });
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'alert-1',
      symbol: 'BTCUSD',
      targetPrice: 95000,
      condition: 'above',
      createdAt: Date.now() - 3600000,
      triggered: false,
    },
    {
      id: 'alert-2',
      symbol: 'NVDA',
      targetPrice: 155,
      condition: 'above',
      createdAt: Date.now() - 7200000,
      triggered: false,
    },
  ]);
  const [alertToast, setAlertToast] = useState<string | null>(null);
  const [isLiveSimulation, setIsLiveSimulation] = useState<boolean>(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [watchlistDrawerOpen, setWatchlistDrawerOpen] = useState<boolean>(false);
  const [detailModalAsset, setDetailModalAsset] = useState<MarketAsset | null>(null);

  // Paper trading simulation
  const [paperBalance, setPaperBalance] = useState<number>(100000);
  const [paperPositions, setPaperPositions] = useState<PaperTradePosition[]>([
    {
      symbol: 'NVDA',
      assetName: 'NVIDIA Corporation',
      type: 'BUY',
      shares: 100,
      entryPrice: 142.50,
      currentPrice: 148.88,
      timestamp: Date.now() - 86400000,
    },
    {
      symbol: 'BTCUSD',
      assetName: 'Bitcoin',
      type: 'BUY',
      shares: 0.5,
      entryPrice: 88200,
      currentPrice: 91420.50,
      timestamp: Date.now() - 172800000,
    },
  ]);

  // Sync theme to document.documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save watchlist
  useEffect(() => {
    try {
      localStorage.setItem('tv_watchlist', JSON.stringify(watchlist));
    } catch {
      // ignore
    }
  }, [watchlist]);

  const selectAsset = useCallback((target: string | MarketAsset) => {
    if (typeof target === 'string') {
      const found = assets.find((a) => a.symbol.toUpperCase() === target.toUpperCase() || a.id === target.toLowerCase());
      if (found) setSelectedAsset(found);
    } else {
      setSelectedAsset(target);
    }
  }, [assets]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) => {
      const normalized = symbol.toUpperCase();
      if (prev.includes(normalized)) {
        return prev.filter((s) => s !== normalized);
      } else {
        return [...prev, normalized];
      }
    });
  }, []);

  const isInWatchlist = useCallback((symbol: string) => {
    return watchlist.includes(symbol.toUpperCase());
  }, [watchlist]);

  const addAlert = useCallback((symbol: string, targetPrice: number, condition: 'above' | 'below') => {
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      createdAt: Date.now(),
      triggered: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setAlertToast(`Alert set for ${symbol.toUpperCase()} when price moves ${condition} $${targetPrice.toLocaleString()}`);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggleLiveSimulation = useCallback(() => {
    setIsLiveSimulation((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const openDetailModal = useCallback((asset: MarketAsset) => {
    setDetailModalAsset(asset);
  }, []);

  const closeDetailModal = useCallback(() => {
    setDetailModalAsset(null);
  }, []);

  const clearAlertToast = useCallback(() => {
    setAlertToast(null);
  }, []);

  // Paper Trade execution
  const executePaperTrade = useCallback((symbol: string, type: 'BUY' | 'SELL', shares: number) => {
    const asset = assets.find((a) => a.symbol.toUpperCase() === symbol.toUpperCase());
    if (!asset) return { success: false, message: 'Asset not found' };

    const cost = asset.price * shares;
    if (type === 'BUY') {
      if (paperBalance < cost) {
        return { success: false, message: `Insufficient paper funds ($${paperBalance.toFixed(2)} available)` };
      }
      setPaperBalance((b) => b - cost);
      setPaperPositions((prev) => {
        const existing = prev.find((p) => p.symbol === symbol && p.type === 'BUY');
        if (existing) {
          const totalShares = existing.shares + shares;
          const avgPrice = (existing.entryPrice * existing.shares + cost) / totalShares;
          return prev.map((p) => (p.symbol === symbol ? { ...p, shares: totalShares, entryPrice: avgPrice, currentPrice: asset.price } : p));
        }
        return [
          ...prev,
          {
            symbol: asset.symbol,
            assetName: asset.name,
            type: 'BUY',
            shares,
            entryPrice: asset.price,
            currentPrice: asset.price,
            timestamp: Date.now(),
          },
        ];
      });
      return { success: true, message: `Bought ${shares} shares of ${asset.symbol} at $${asset.price.toFixed(2)}` };
    } else {
      // SELL / SHORT
      setPaperBalance((b) => b + cost);
      setPaperPositions((prev) => {
        const existing = prev.find((p) => p.symbol === symbol);
        if (existing && existing.shares >= shares) {
          if (existing.shares === shares) {
            return prev.filter((p) => p.symbol !== symbol);
          }
          return prev.map((p) => (p.symbol === symbol ? { ...p, shares: p.shares - shares, currentPrice: asset.price } : p));
        }
        return [
          ...prev,
          {
            symbol: asset.symbol,
            assetName: asset.name,
            type: 'SELL',
            shares,
            entryPrice: asset.price,
            currentPrice: asset.price,
            timestamp: Date.now(),
          },
        ];
      });
      return { success: true, message: `Sold ${shares} shares of ${asset.symbol} at $${asset.price.toFixed(2)}` };
    }
  }, [assets, paperBalance]);

  const closePaperPosition = useCallback((symbol: string) => {
    const pos = paperPositions.find((p) => p.symbol === symbol);
    const asset = assets.find((a) => a.symbol === symbol);
    if (!pos || !asset) return;

    const returnAmount = pos.type === 'BUY'
      ? asset.price * pos.shares
      : pos.entryPrice * pos.shares + (pos.entryPrice - asset.price) * pos.shares;

    setPaperBalance((b) => b + returnAmount);
    setPaperPositions((prev) => prev.filter((p) => p.symbol !== symbol));
    setAlertToast(`Closed position in ${symbol} at $${asset.price.toFixed(2)}`);
  }, [paperPositions, assets]);

  // Real-time live price tick simulation loop
  useEffect(() => {
    if (!isLiveSimulation) return;

    const interval = setInterval(() => {
      // Pick 2 to 4 random assets to tick
      const indicesToTick: number[] = [];
      const count = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * assets.length);
        if (!indicesToTick.includes(idx)) indicesToTick.push(idx);
      }

      setAssets((prev) => {
        const updated = [...prev];

        indicesToTick.forEach((idx) => {
          const item = updated[idx];
          // random delta (-0.35% to +0.38% with slight upward bias)
          const pctDelta = (Math.random() - 0.48) * 0.007;
          let newPrice = item.price * (1 + pctDelta);
          if (item.category === 'forex') {
            newPrice = Number(newPrice.toFixed(4));
          } else if (item.price < 5) {
            newPrice = Number(newPrice.toFixed(3));
          } else {
            newPrice = Number(newPrice.toFixed(2));
          }

          const isUp = newPrice >= item.price;
          const diff = newPrice - item.previousClose;
          const pct = (diff / item.previousClose) * 100;
          const newSparkline = [...item.sparkline.slice(1), newPrice];

          updated[idx] = {
            ...item,
            price: newPrice,
            change: Number(diff.toFixed(item.category === 'forex' ? 4 : 2)),
            changePercent: Number(pct.toFixed(2)),
            high24h: Math.max(item.high24h, newPrice),
            low24h: Math.min(item.low24h, newPrice),
            sparkline: newSparkline,
            flash: isUp ? 'up' : 'down',
          };

          // Check if selectedAsset is this item
          if (selectedAsset.id === item.id) {
            setSelectedAsset((prevSel) => ({
              ...prevSel,
              price: newPrice,
              change: Number(diff.toFixed(item.category === 'forex' ? 4 : 2)),
              changePercent: Number(pct.toFixed(2)),
              high24h: Math.max(item.high24h, newPrice),
              low24h: Math.min(item.low24h, newPrice),
              sparkline: newSparkline,
              flash: isUp ? 'up' : 'down',
            }));
          }

          // Check alert triggers
          alerts.forEach((alert) => {
            if (!alert.triggered && alert.symbol === item.symbol) {
              if (alert.condition === 'above' && newPrice >= alert.targetPrice) {
                setAlertToast(`🔔 ALERT TRIGGERED: ${item.symbol} crossed above $${alert.targetPrice.toLocaleString()} (Now: $${newPrice.toLocaleString()})`);
                setAlerts((allAlerts) =>
                  allAlerts.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
                );
              } else if (alert.condition === 'below' && newPrice <= alert.targetPrice) {
                setAlertToast(`🔔 ALERT TRIGGERED: ${item.symbol} fell below $${alert.targetPrice.toLocaleString()} (Now: $${newPrice.toLocaleString()})`);
                setAlerts((allAlerts) =>
                  allAlerts.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
                );
              }
            }
          });
        });

        return updated;
      });

      // Clear flashes after 700ms
      setTimeout(() => {
        setAssets((current) => current.map((a) => (a.flash ? { ...a, flash: null } : a)));
      }, 700);

    }, 1400);

    return () => clearInterval(interval);
  }, [isLiveSimulation, assets.length, selectedAsset.id, alerts]);

  // Keep paper positions synced with current asset prices
  useEffect(() => {
    setPaperPositions((positions) =>
      positions.map((pos) => {
        const found = assets.find((a) => a.symbol === pos.symbol);
        return found ? { ...pos, currentPrice: found.price } : pos;
      })
    );
  }, [assets]);

  return (
    <MarketContext.Provider
      value={{
        assets,
        selectedAsset,
        activeScreen,
        watchlist,
        alerts,
        alertToast,
        isLiveSimulation,
        theme,
        searchModalOpen,
        watchlistDrawerOpen,
        detailModalAsset,
        paperBalance,
        paperPositions,
        selectAsset,
        setActiveScreen,
        toggleWatchlist,
        isInWatchlist,
        addAlert,
        removeAlert,
        toggleLiveSimulation,
        toggleTheme,
        setSearchModalOpen,
        setWatchlistDrawerOpen,
        openDetailModal,
        closeDetailModal,
        clearAlertToast,
        executePaperTrade,
        closePaperPosition,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) throw new Error('useMarket must be used within a MarketProvider');
  return context;
};
