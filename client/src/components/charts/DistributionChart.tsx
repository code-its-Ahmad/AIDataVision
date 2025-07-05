import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

interface DistributionChartProps {
  timeRange: string;
}

export function DistributionChart({ timeRange }: DistributionChartProps) {
  const data = useMemo(() => {
    // Generate distribution data based on time range
    const baseData = [
      { name: 'Positive Predictions', value: 45, color: 'hsl(142, 76%, 36%)' },
      { name: 'Negative Predictions', value: 30, color: 'hsl(0, 84%, 60%)' },
      { name: 'Neutral Predictions', value: 20, color: 'hsl(48, 96%, 53%)' },
      { name: 'Uncertain', value: 5, color: 'hsl(240, 5%, 64.9%)' },
    ];

    // Adjust values based on time range
    const multiplier = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    
    return baseData.map(item => ({
      ...item,
      value: Math.round(item.value * multiplier * (0.8 + Math.random() * 0.4))
    }));
  }, [timeRange]);

  const formatTooltip = (value: number, name: string) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const percentage = ((value / total) * 100).toFixed(1);
    return [`${value} (${percentage}%)`, name];
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{
              color: 'hsl(var(--foreground))',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
