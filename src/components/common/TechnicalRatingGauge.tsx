import React from 'react';
import { TechnicalRating } from '../../types/market';

interface TechnicalRatingGaugeProps {
  rating: TechnicalRating;
  oscillators?: { buy: number; neutral: number; sell: number };
  movingAverages?: { buy: number; neutral: number; sell: number };
  compact?: boolean;
}

export const TechnicalRatingGauge: React.FC<TechnicalRatingGaugeProps> = ({
  rating,
  oscillators,
  movingAverages,
  compact = false,
}) => {
  // Map rating to angle in degrees (-70 to +70)
  const angleMap: Record<TechnicalRating, number> = {
    'Strong Sell': -70,
    'Sell': -35,
    'Neutral': 0,
    'Buy': 35,
    'Strong Buy': 70,
  };

  const angle = angleMap[rating] ?? 0;

  const colorMap: Record<TechnicalRating, string> = {
    'Strong Sell': '#f23645',
    'Sell': '#f77c80',
    'Neutral': '#787b86',
    'Buy': '#26a69a',
    'Strong Buy': '#089981',
  };

  const currentColor = colorMap[rating] || '#787b86';

  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
        style={{
          color: currentColor,
          backgroundColor: `${currentColor}15`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: currentColor }} />
        {rating}
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 bg-[#1e222d] dark:bg-[#1e222d] border border-[#2a2e39] rounded-lg">
      <div className="text-xs uppercase tracking-wider text-[#787b86] font-medium mb-3">
        Technical Analysis Gauge
      </div>

      {/* Speedometer Arc */}
      <div className="relative w-48 h-24 flex items-end justify-center overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-48 h-24">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f23645" />
              <stop offset="25%" stopColor="#f77c80" />
              <stop offset="50%" stopColor="#787b86" />
              <stop offset="75%" stopColor="#26a69a" />
              <stop offset="100%" stopColor="#089981" />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 95 A 80 80 0 0 1 180 95"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Needle Base Pin */}
          <circle cx="100" cy="95" r="7" fill="#d1d4dc" />
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-1 w-1 bg-white origin-bottom rounded-full transition-transform duration-700 ease-out shadow-md"
          style={{
            height: '68px',
            transform: `rotate(${angle}deg)`,
          }}
        />
      </div>

      {/* Rating Label */}
      <div className="mt-2 text-center">
        <div className="text-base font-bold tracking-tight" style={{ color: currentColor }}>
          {rating.toUpperCase()}
        </div>
        <div className="text-xs text-[#787b86] mt-0.5">Summary of 26 technical indicators</div>
      </div>

      {/* Oscillators and Moving Averages Breakdowns */}
      {(oscillators || movingAverages) && (
        <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-3 border-t border-[#2a2e39] text-xs">
          {oscillators && (
            <div className="text-center">
              <div className="text-[#787b86] mb-1 font-medium">Oscillators</div>
              <div className="flex items-center justify-center gap-2 font-mono tabular-nums text-[11px]">
                <span className="text-[#f23645]">{oscillators.sell} Sell</span>
                <span className="text-[#787b86]">{oscillators.neutral} Neutral</span>
                <span className="text-[#089981]">{oscillators.buy} Buy</span>
              </div>
            </div>
          )}

          {movingAverages && (
            <div className="text-center">
              <div className="text-[#787b86] mb-1 font-medium">Moving Averages</div>
              <div className="flex items-center justify-center gap-2 font-mono tabular-nums text-[11px]">
                <span className="text-[#f23645]">{movingAverages.sell} Sell</span>
                <span className="text-[#787b86]">{movingAverages.neutral} Neutral</span>
                <span className="text-[#089981]">{movingAverages.buy} Buy</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
