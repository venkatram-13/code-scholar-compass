
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Code, Target, Brain, Zap, Award, TrendingUp } from 'lucide-react';

interface PlatformScore {
  platform: string;
  icon: any;
  score: number;
  maxScore: number;
  problemsSolved: number;
  contests?: number;
  rating?: number;
  color: string;
}

// Mock data for demonstration
const mockPlatformScores: PlatformScore[] = [
  {
    platform: "Codeforces",
    icon: Code,
    score: 850,
    maxScore: 1000,
    problemsSolved: 142,
    contests: 25,
    rating: 1547,
    color: "bg-blue-500"
  },
  {
    platform: "LeetCode",
    icon: Trophy,
    score: 720,
    maxScore: 1000,
    problemsSolved: 234,
    contests: 12,
    rating: 1832,
    color: "bg-orange-500"
  },
  {
    platform: "CodeChef",
    icon: Target,
    score: 650,
    maxScore: 1000,
    problemsSolved: 89,
    contests: 8,
    rating: 1623,
    color: "bg-amber-600"
  },
  {
    platform: "InterviewBit",
    icon: Brain,
    score: 580,
    maxScore: 1000,
    problemsSolved: 156,
    color: "bg-purple-500"
  },
  {
    platform: "GeeksforGeeks",
    icon: Zap,
    score: 490,
    maxScore: 1000,
    problemsSolved: 98,
    color: "bg-green-500"
  },
  {
    platform: "HackerRank",
    icon: Award,
    score: 710,
    maxScore: 1000,
    problemsSolved: 187,
    contests: 6,
    color: "bg-emerald-600"
  }
];

const Index = () => {
  const totalScore = mockPlatformScores.reduce((sum, platform) => sum + platform.score, 0);
  const maxPossibleScore = mockPlatformScores.length * 1000;
  const overallPercentage = (totalScore / maxPossibleScore) * 100;

  const topPerformers = [...mockPlatformScores].sort((a, b) => b.score - a.score).slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Platform Dashboard</h1>
            <p className="text-muted-foreground">Combined performance across all coding platforms</p>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Performance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{totalScore.toLocaleString()}</span>
                <span className="text-muted-foreground">/ {maxPossibleScore.toLocaleString()}</span>
              </div>
              <Progress value={overallPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {overallPercentage.toFixed(1)}% of maximum possible score across all platforms
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topPerformers.map((platform, index) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.platform} className="flex items-center gap-3 p-4 border rounded-lg">
                    <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{platform.platform}</span>
                        {index === 0 && <Badge variant="default">Best</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">Score: {platform.score}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Platform Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPlatformScores.map((platform) => {
            const Icon = platform.icon;
            const percentage = (platform.score / platform.maxScore) * 100;
            
            return (
              <Card key={platform.platform}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {platform.platform}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Score</span>
                      <span className="text-sm text-muted-foreground">{platform.score}/{platform.maxScore}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Problems</p>
                      <p className="font-medium">{platform.problemsSolved}</p>
                    </div>
                    {platform.contests && (
                      <div>
                        <p className="text-muted-foreground">Contests</p>
                        <p className="font-medium">{platform.contests}</p>
                      </div>
                    )}
                  </div>
                  
                  {platform.rating && (
                    <div>
                      <p className="text-muted-foreground text-sm">Current Rating</p>
                      <p className="font-medium">{platform.rating}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
