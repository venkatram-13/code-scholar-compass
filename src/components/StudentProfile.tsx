
import { useState, useMemo } from 'react';
import { Student, Contest, Problem } from '@/types/student';
import { mockContests, mockProblems } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Calendar, Award } from 'lucide-react';
import { RatingChart } from './RatingChart';
import { SubmissionHeatmap } from './SubmissionHeatmap';
import { ProblemDistributionChart } from './ProblemDistributionChart';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

export function StudentProfile({ student, onBack }: StudentProfileProps) {
  const [contestFilter, setContestFilter] = useState('365');
  const [problemFilter, setProblemFilter] = useState('30');

  const filteredContests = useMemo(() => {
    const days = parseInt(contestFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return mockContests.filter(contest => contest.date >= cutoffDate);
  }, [contestFilter]);

  const filteredProblems = useMemo(() => {
    const days = parseInt(problemFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return mockProblems.filter(problem => problem.solvedAt >= cutoffDate);
  }, [problemFilter]);

  const problemStats = useMemo(() => {
    const totalSolved = filteredProblems.length;
    const averageRating = totalSolved > 0 
      ? Math.round(filteredProblems.reduce((sum, p) => sum + p.rating, 0) / totalSolved)
      : 0;
    const maxProblemRating = filteredProblems.reduce((max, p) => Math.max(max, p.rating), 0);
    const averagePerDay = totalSolved / parseInt(problemFilter);

    const ratingDistribution: { [key: string]: number } = {};
    filteredProblems.forEach(problem => {
      const bucket = Math.floor(problem.rating / 100) * 100;
      const key = `${bucket}-${bucket + 99}`;
      ratingDistribution[key] = (ratingDistribution[key] || 0) + 1;
    });

    return {
      totalSolved,
      averageRating,
      maxProblemRating,
      averagePerDay: Math.round(averagePerDay * 10) / 10,
      ratingDistribution,
    };
  }, [filteredProblems, problemFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">@{student.codeforcesHandle}</p>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current Rating</p>
                <p className="text-xl font-bold">{student.currentRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Max Rating</p>
                <p className="text-xl font-bold">{student.maxRating}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{student.lastUpdated.toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${student.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={student.isActive ? "default" : "destructive"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contests">Contest History</TabsTrigger>
          <TabsTrigger value="problems">Problem Solving Data</TabsTrigger>
        </TabsList>

        <TabsContent value="contests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Contest Performance</h3>
            <Select value={contestFilter} onValueChange={setContestFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 365 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rating Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingChart contests={filteredContests} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contest List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {filteredContests.map((contest) => (
                    <div key={contest.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{contest.name}</h4>
                        <Badge variant={contest.ratingChange >= 0 ? "default" : "destructive"}>
                          {contest.ratingChange >= 0 ? '+' : ''}{contest.ratingChange}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Rank: {contest.rank} | Problems: {contest.problemsSolved}/{contest.totalProblems}</p>
                        <p>Date: {contest.date.toLocaleDateString()} | Rating: {contest.newRating}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Problem Solving Analytics</h3>
            <Select value={problemFilter} onValueChange={setProblemFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{problemStats.totalSolved}</p>
                <p className="text-sm text-muted-foreground">Total Solved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{problemStats.maxProblemRating}</p>
                <p className="text-sm text-muted-foreground">Max Difficulty</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{problemStats.averageRating}</p>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">{problemStats.averagePerDay}</p>
                <p className="text-sm text-muted-foreground">Per Day</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Problem Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ProblemDistributionChart data={problemStats.ratingDistribution} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submission Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <SubmissionHeatmap problems={filteredProblems} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
