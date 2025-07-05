import { useMemo } from 'react';
import { HeatmapData } from '@/types/dashboard';

export function HeatmapChart() {
  const data = useMemo(() => {
    // Generate feature correlation heatmap data
    const features = ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E'];
    const heatmapData: HeatmapData[] = [];
    
    for (let i = 0; i < features.length; i++) {
      for (let j = 0; j < features.length; j++) {
        let value;
        if (i === j) {
          value = 1; // Perfect correlation with itself
        } else {
          value = Math.random() * 2 - 1; // Random correlation between -1 and 1
        }
        
        heatmapData.push({
          x: features[i],
          y: features[j],
          value: value
        });
      }
    }
    
    return heatmapData;
  }, []);

  const getColorIntensity = (value: number) => {
    // Normalize value from -1,1 to 0,1
    const normalized = (value + 1) / 2;
    
    if (value > 0) {
      // Positive correlation - blue scale
      return `hsl(207, 90%, ${100 - normalized * 50}%)`;
    } else {
      // Negative correlation - red scale
      return `hsl(0, 84%, ${100 - Math.abs(normalized) * 50}%)`;
    }
  };

  const features = ['Feature A', 'Feature B', 'Feature C', 'Feature D', 'Feature E'];
  const cellSize = 48;

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="relative">
        <svg width={cellSize * features.length} height={cellSize * features.length}>
          {data.map((item, index) => {
            const xIndex = features.indexOf(item.x);
            const yIndex = features.indexOf(item.y);
            
            return (
              <g key={index}>
                <rect
                  x={xIndex * cellSize}
                  y={yIndex * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill={getColorIntensity(item.value)}
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                />
                <text
                  x={xIndex * cellSize + cellSize / 2}
                  y={yIndex * cellSize + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="hsl(var(--foreground))"
                  fontWeight="bold"
                >
                  {item.value.toFixed(2)}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Feature labels */}
        <div className="absolute -top-6 left-0 flex">
          {features.map((feature, index) => (
            <div
              key={feature}
              className="text-xs text-muted-foreground text-center"
              style={{ width: cellSize, left: index * cellSize }}
            >
              {feature}
            </div>
          ))}
        </div>
        
        <div className="absolute top-0 -left-20 flex flex-col">
          {features.map((feature, index) => (
            <div
              key={feature}
              className="text-xs text-muted-foreground text-right"
              style={{ height: cellSize, lineHeight: `${cellSize}px` }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
