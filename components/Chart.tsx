import React, { useState } from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  data: ChartDataPoint[];
  type: 'bar' | 'line';
  yAxisLabel: string;
}

interface TooltipData {
  x: number;
  y: number;
  label: string;
  value: number;
}

const Chart: React.FC<ChartProps> = ({ data, type, yAxisLabel }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const width = 800;
  const height = 400;
  const padding = { top: 20, right: 20, bottom: 60, left: 80 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 0);
  
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => (maxValue / yTicks) * i);

  const formatYLabel = (value: number) => {
      if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
      return value.toString();
  };

  const BarChart = () => {
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    return (
      <g>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = padding.left + i * (barWidth + barSpacing) + barSpacing / 2;
          const y = padding.top + chartHeight - barHeight;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="currentColor"
              className="text-blue-500 hover:text-blue-700 transition-colors"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                    x: rect.left + window.scrollX + rect.width / 2,
                    y: rect.top + window.scrollY - 10,
                    label: d.label, 
                    value: d.value 
                });
              }}
              onMouseLeave={() => setTooltip(null)}
            />
          );
        })}
      </g>
    );
  };
  
  const LineChart = () => {
    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.value / maxValue) * chartHeight;
        return { x, y, ...d };
    });

    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    return (
      <g>
        <path d={pathD} fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
        {points.map((p, i) => (
            <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="4"
                fill="currentColor"
                className="text-blue-500"
                onMouseMove={(e) => setTooltip({
                    x: e.clientX, 
                    y: e.clientY - 10,
                    label: p.label, 
                    value: p.value 
                })}
                onMouseLeave={() => setTooltip(null)}
            />
        ))}
      </g>
    );
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis */}
        <text
            transform={`translate(${padding.left / 3}, ${height / 2}) rotate(-90)`}
            textAnchor="middle"
            className="fill-current text-gray-500 text-sm"
        >
            {yAxisLabel}
        </text>
        {yTickValues.map((tick, i) => {
            const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
            return (
                <g key={i} className="text-gray-400">
                    <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="currentColor" strokeDasharray="2,2" />
                    <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-current text-xs">
                        {formatYLabel(tick)}
                    </text>
                </g>
            );
        })}

        {/* X-axis */}
        {data.map((d, i) => {
            const x = type === 'bar' 
                ? padding.left + i * (chartWidth / data.length) + (chartWidth / data.length) / 2
                : padding.left + (i / (data.length - 1)) * chartWidth;
            return (
                <text 
                    key={i}
                    x={x} 
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    className="fill-current text-gray-500 text-xs"
                >
                    {d.label}
                </text>
            );
        })}
        <line x1={padding.left} x2={width - padding.right} y1={height-padding.bottom} y2={height-padding.bottom} className="stroke-current text-gray-300" />
        
        {type === 'bar' ? <BarChart /> : <LineChart />}
      </svg>
      {tooltip && (
        <div 
            className="absolute bg-gray-800 text-white text-xs rounded-md py-1 px-2 pointer-events-none transition-opacity"
            style={{ 
                left: `${tooltip.x}px`, 
                top: `${tooltip.y}px`,
                transform: 'translate(-50%, -100%)'
            }}
        >
            <p className="font-bold">{tooltip.label}</p>
            <p>{yAxisLabel === 'Number of Parcels' ? tooltip.value : `LKR ${tooltip.value.toLocaleString()}`}</p>
        </div>
      )}
    </div>
  );
};

export default Chart;
