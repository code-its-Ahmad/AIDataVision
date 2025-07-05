import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ModelPerformance } from '@/types/dashboard';

interface PerformanceChartProps {
  data: ModelPerformance[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'accuracy' || name === 'f1Score') {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(4);
  };

  const formatTooltipLabel = (label: string) => {
    return `Time: ${formatTime(label)}`;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
            formatter={formatTooltipValue}
            labelFormatter={formatTooltipLabel}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="accuracy" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            name="Accuracy"
          />
          <Line 
            type="monotone" 
            dataKey="f1Score" 
            stroke="hsl(142, 76%, 36%)" 
            strokeWidth={2}
            dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(142, 76%, 36%)', strokeWidth: 2 }}
            name="F1 Score"
          />
          <Line 
            type="monotone" 
            dataKey="loss" 
            stroke="hsl(0, 84%, 60%)" 
            strokeWidth={2}
            dot={{ fill: 'hsl(0, 84%, 60%)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(0, 84%, 60%)', strokeWidth: 2 }}
            name="Loss"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
