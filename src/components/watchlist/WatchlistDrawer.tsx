import React, { useState } from 'react';
import { useMarket } from '../../context/MarketContext';
import { X, Plus, Trash2, TrendingUp, Bell, DollarSign, ArrowUpRight, ArrowDownRight, Check } from 'lucide-react';

export const WatchlistDrawer: React.FC = () => {
  const {
    watchlistDrawerOpen,
    setWatchlistDrawerOpen,
    watchlist,
    toggleWatchlist,
    assets,
    selectAsset,
    setActiveScreen,
    alerts,
    removeAlert,
    addAlert,
    paperBalance,
    paperPositions,
    closePaperPosition,
  } = useMarket();

  const [tab, setTab] = useState<'watchlist' | 'alerts' | 'portfolio'>('watchlist');
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [alertSymbol, setAlertSymbol] = useState('NVDA');
  const [alertPrice, setAlertPrice] = useState(150);
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  if (!watchlistDrawerOpen) return null;

  const watchlistAssets = watchlist
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean);

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbolInput.trim()) return;
    const found = assets.find(
      (a) => a.symbol.toUpperCase() === newSymbolInput.trim().toUpperCase()
    );
    if (found) {
      if (!watchlist.includes(found.symbol)) {
        toggleWatchlist(found.symbol);
      }
      setNewSymbolInput('');
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertSymbol || !alertPrice) return;
    addAlert(alertSymbol, alertPrice, alertCondition);
  };

  // Portfolio total value
  const totalPositionValue = paperPositions.reduce((acc, pos) => acc + pos.shares * pos.currentPrice, 0);
  const totalNetWorth = paperBalance + totalPositionValue;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-[#1e222d] border-l border-[#2a2e39] h-full shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2e39]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Market Station</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-[#2a2e39] text-[#2962ff] font-mono">
              Pro Terminal
            </span>
          </div>

          <button
            onClick={() => setWatchlistDrawerOpen(false)}
            className="p-1.5 text-[#787b86] hover:text-white rounded hover:bg-[#2a2e39] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center border-b border-[#2a2e39] bg-[#171b26] text-xs font-semibold">
          <button
            onClick={() => setTab('watchlist')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'watchlist'
                ? 'border-[#2962ff] text-white bg-[#1e222d]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => setTab('alerts')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'alerts'
                ? 'border-[#2962ff] text-white bg-[#1e222d]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setTab('portfolio')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              tab === 'portfolio'
                ? 'border-[#2962ff] text-white bg-[#1e222d]'
                : 'border-transparent text-[#787b86] hover:text-white'
            }`}
          >
            Paper Trade
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: WATCHLIST */}
          {tab === 'watchlist' && (
            <div className="space-y-4">
              {/* Add Symbol Input */}
              <form onSubmit={handleAddSymbol} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add symbol (e.g. TSLA, NVDA, ETHUSD)..."
                  value={newSymbolInput}
                  onChange={(e) => setNewSymbolInput(e.target.value)}
                  className="flex-1 bg-[#131722] border border-[#2a2e39] rounded px-3 py-2 text-xs text-white placeholder-[#787b86] focus:outline-none focus:border-[#2962ff]"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>

              {/* Watchlist Items */}
              <div className="divide-y divide-[#2a2e39] border border-[#2a2e39] rounded-lg overflow-hidden bg-[#131722]">
                {watchlistAssets.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#787b86]">
                    Your watchlist is empty. Add symbols above.
                  </div>
                ) : (
                  watchlistAssets.map((item) => {
                    if (!item) return null;
                    const isUp = item.change >= 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          selectAsset(item);
                          setActiveScreen('chart');
                        }}
                        className={`flex items-center justify-between p-3 hover:bg-[#2a2e39]/50 transition-colors cursor-pointer group ${
                          item.flash === 'up' ? 'flash-up' : item.flash === 'down' ? 'flash-down' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center font-bold text-white text-[11px] shrink-0"
                            style={{ backgroundColor: item.logoBg || '#2962ff' }}
                          >
                            {item.logoText || item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-[#2962ff] transition-colors">
                              {item.symbol}
                            </div>
                            <div className="text-[10px] text-[#787b86] truncate max-w-[120px]">
                              {item.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-mono text-xs font-bold text-white">
                              ${item.price >= 10 ? item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : item.price.toFixed(4)}
                            </div>
                            <div
                              className={`font-mono text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                                isUp ? 'text-[#089981]' : 'text-[#f23645]'
                              }`}
                            >
                              {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {isUp ? '+' : ''}
                              {item.changePercent.toFixed(2)}%
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWatchlist(item.symbol);
                            }}
                            className="p-1 text-[#787b86] hover:text-[#f23645] rounded transition-colors"
                            title="Remove from Watchlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ALERTS */}
          {tab === 'alerts' && (
            <div className="space-y-4">
              {/* Create alert form */}
              <form onSubmit={handleCreateAlert} className="p-3 bg-[#131722] border border-[#2a2e39] rounded-lg space-y-3">
                <div className="text-xs font-semibold text-white">Create Price Alert</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-[#787b86]">Symbol</label>
                    <select
                      value={alertSymbol}
                      onChange={(e) => setAlertSymbol(e.target.value)}
                      className="w-full bg-[#1e222d] text-white border border-[#2a2e39] rounded px-2.5 py-1.5 mt-1 focus:outline-none focus:border-[#2962ff]"
                    >
                      {assets.map((a) => (
                        <option key={a.id} value={a.symbol}>
                          {a.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-[#787b86]">Condition</label>
                    <select
                      value={alertCondition}
                      onChange={(e) => setAlertCondition(e.target.value as any)}
                      className="w-full bg-[#1e222d] text-white border border-[#2a2e39] rounded px-2.5 py-1.5 mt-1 focus:outline-none focus:border-[#2962ff]"
                    >
                      <option value="above">Crosses Above</option>
                      <option value="below">Crosses Below</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#787b86]">Target Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(Number(e.target.value))}
                    className="w-full bg-[#1e222d] text-white font-mono border border-[#2a2e39] rounded px-2.5 py-1.5 mt-1 text-xs focus:outline-none focus:border-[#2962ff]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#2962ff] hover:bg-[#1e53e5] text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Alert
                </button>
              </form>

              {/* Alerts list */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white">Active Alerts</div>
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="flex items-center justify-between p-3 bg-[#131722] border border-[#2a2e39] rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-[#2962ff]" />
                      <div>
                        <div className="font-bold text-white font-mono">{al.symbol}</div>
                        <div className="text-[11px] text-[#787b86]">
                          {al.condition} ${al.targetPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${al.triggered ? 'bg-[#089981]/20 text-[#089981]' : 'bg-[#2a2e39] text-[#787b86]'}`}>
                        {al.triggered ? 'Triggered' : 'Watching'}
                      </span>
                      <button
                        onClick={() => removeAlert(al.id)}
                        className="p-1 text-[#787b86] hover:text-[#f23645] rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PORTFOLIO */}
          {tab === 'portfolio' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#131722] border border-[#2a2e39] rounded-lg space-y-3">
                <div className="text-xs text-[#787b86]">Virtual Portfolio Balance</div>
                <div className="text-2xl font-bold font-mono text-white">
                  ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#2a2e39]">
                  <div>
                    <span className="text-[#787b86]">Available Cash:</span>
                    <div className="font-mono text-white font-semibold">${paperBalance.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-[#787b86]">Invested:</span>
                    <div className="font-mono text-white font-semibold">${totalPositionValue.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-white">Active Positions</div>
                {paperPositions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#787b86]">
                    No open positions. Use the SuperChart trade console to execute trades!
                  </div>
                ) : (
                  paperPositions.map((pos) => {
                    const pnl = (pos.currentPrice - pos.entryPrice) * pos.shares;
                    const pnlPct = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
                    const isProfit = pnl >= 0;

                    return (
                      <div
                        key={pos.symbol}
                        className="p-3 bg-[#131722] border border-[#2a2e39] rounded-lg space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white font-mono">{pos.symbol}</div>
                          <span
                            className={`font-mono font-bold text-xs ${
                              isProfit ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {isProfit ? '+' : ''}${pnl.toFixed(2)} ({isProfit ? '+' : ''}
                            {pnlPct.toFixed(2)}%)
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#787b86]">
                          <span>
                            {pos.shares} units @ ${pos.entryPrice.toFixed(2)}
                          </span>
                          <span>Now: ${pos.currentPrice.toFixed(2)}</span>
                        </div>

                        <button
                          onClick={() => closePaperPosition(pos.symbol)}
                          className="w-full py-1 bg-[#2a2e39] hover:bg-[#363a45] text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Market Close Position
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
