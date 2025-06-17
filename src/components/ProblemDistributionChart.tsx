
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProblemDistributionChartProps {
  data: { [key: string]: number };
}

export function ProblemDistributionChart({ data }: ProblemDistributionChartProps) {
  const chartData = Object.entries(data)
    .map(([range, count]) => ({
      range,
      count,
    }))
    .sort((a, b) => {
      const aStart = parseInt(a.range.split('-')[0]);
      const bStart = parseInt(b.range.split('-')[0]);
      return aStart - bStart;
    });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="range" 
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
            formatter={(value: number) => [value, 'Problems Solved']}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--primary))" 
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
