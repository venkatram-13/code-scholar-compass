
import { Problem } from '@/types/student';
import { useMemo } from 'react';

interface SubmissionHeatmapProps {
  problems: Problem[];
}

export function SubmissionHeatmap({ problems }: SubmissionHeatmapProps) {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const days = [];
    
    // Generate last 90 days
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayProblems = problems.filter(p => 
        p.solvedAt.toDateString() === date.toDateString()
      ).length;
      
      days.push({
        date: date.toDateString(),
        count: dayProblems,
        display: date.getDate(),
        month: date.getMonth(),
      });
    }
    
    return days;
  }, [problems]);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted/30';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900/40';
    if (count <= 4) return 'bg-green-400 dark:bg-green-800/60';
    if (count <= 6) return 'bg-green-600 dark:bg-green-700/80';
    return 'bg-green-800 dark:bg-green-600';
  };

  // Group by weeks
  const weeks = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-13 gap-1 text-xs">
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square rounded-sm ${getIntensity(day.count)} 
                         hover:ring-2 hover:ring-primary/50 transition-all duration-200
                         cursor-pointer relative group`}
              title={`${day.date}: ${day.count} problems solved`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-medium opacity-60">
                  {day.count > 0 ? day.count : ''}
                </span>
              </div>
            </div>
          ))
        ))}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getIntensity(level * 2)}`}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
