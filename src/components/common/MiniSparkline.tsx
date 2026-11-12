import React from 'react';

interface MiniSparklineProps {
  data: number[];
  isPositive?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  isPositive,
  width = 90,
  height = 28,
  className = '',
}) => {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const innerHeight = height - padding * 2;
  const innerWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * innerWidth;
    const y = height - padding - ((val - min) / range) * innerHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const strokeColor = isPositive ?? (data[data.length - 1] >= data[0]) ? '#089981' : '#f23645';
  const fillColor = isPositive ?? (data[data.length - 1] >= data[0]) 
    ? 'rgba(8, 153, 129, 0.12)' 
    : 'rgba(242, 54, 69, 0.12)';

  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <svg width={width} height={height} className={`overflow-visible ${className}`} aria-hidden="true">
      <path d={areaD} fill={fillColor} />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
