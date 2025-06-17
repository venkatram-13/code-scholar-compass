
import { Contest } from '@/types/student';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RatingChartProps {
  contests: Contest[];
}

export function RatingChart({ contests }: RatingChartProps) {
  const data = contests
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(contest => ({
      date: contest.date.toLocaleDateString(),
      rating: contest.newRating,
      change: contest.ratingChange,
    }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
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
            formatter={(value: number, name: string) => [
              value,
              name === 'rating' ? 'Rating' : 'Change'
            ]}
          />
          <Line 
            type="monotone" 
            dataKey="rating" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
