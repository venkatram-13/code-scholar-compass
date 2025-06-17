
import { ArrowLeft, Calendar, Trophy, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Student } from '@/types/student';
import { useStudentProgress } from '@/hooks/useStudentProgress';
import { RatingChart } from './RatingChart';
import { ProblemDistributionChart } from './ProblemDistributionChart';
import { SubmissionHeatmap } from './SubmissionHeatmap';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

export const StudentProfile = ({ student, onBack }: StudentProfileProps) => {
  const { data: studentProgress, isLoading } = useStudentProgress(student.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <div className="text-center">Loading student data...</div>
      </div>
    );
  }

  if (!studentProgress) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <div className="text-center">No data found for this student.</div>
      </div>
    );
  }

  const { student: studentData, contests, problems, statistics } = studentProgress;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{studentData.name}</h1>
          <p className="text-muted-foreground">@{studentData.codeforcesHandle}</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Rating</p>
                <p className="text-2xl font-bold">{studentData.currentRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Max Rating</p>
                <p className="text-2xl font-bold">{studentData.maxRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                <p className="text-2xl font-bold">{statistics.totalSolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg per Day</p>
                <p className="text-2xl font-bold">{statistics.averagePerDay.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="rating" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rating">Rating Progress</TabsTrigger>
          <TabsTrigger value="problems">Problem Distribution</TabsTrigger>
          <TabsTrigger value="activity">Activity Heatmap</TabsTrigger>
          <TabsTrigger value="contests">Contest History</TabsTrigger>
        </TabsList>

        <TabsContent value="rating" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rating Progress Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingChart contests={contests} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Problem Distribution by Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <ProblemDistributionChart ratingDistribution={statistics.ratingDistribution} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission Activity (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionHeatmap problems={problems} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Contests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No contest data available
                  </p>
                ) : (
                  contests.slice(0, 10).map((contest) => (
                    <div key={contest.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{contest.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {contest.date.toLocaleDateString()} • Rank: {contest.rank}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={contest.ratingChange >= 0 ? "default" : "destructive"}>
                          {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          New Rating: {contest.newRating}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
