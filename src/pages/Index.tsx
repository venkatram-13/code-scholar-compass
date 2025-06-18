
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Code, Target, Brain, Zap, Award, TrendingUp, Plus, Users } from 'lucide-react';
import { Student } from '@/types/student';
import { StudentPlatformDialog } from '@/components/StudentPlatformDialog';
import { useStudents, useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';
import { usePlatforms, usePlatformScores } from '@/hooks/usePlatforms';

const iconMap = {
  Code: Code,
  Trophy: Trophy,
  Target: Target,
  Brain: Brain,
  Zap: Zap,
  Award: Award,
};

const Index = () => {
  const { data: students = [] } = useStudents();
  const { data: platforms = [] } = usePlatforms();
  const { data: platformScores = [] } = usePlatformScores();
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Calculate average metrics per platform
  const platformMetrics = platforms.map(platform => {
    const platformStudentScores = platformScores.filter(ps => ps.platform_id === platform.id);
    const count = platformStudentScores.length;
    
    const avgProblems = count > 0 
      ? Math.round(platformStudentScores.reduce((sum, ps) => sum + ps.problems_solved, 0) / count)
      : 0;
    const avgRating = count > 0 
      ? Math.round(platformStudentScores.reduce((sum, ps) => sum + ps.avg_rating, 0) / count)
      : 0;
    const avgContests = count > 0 
      ? Math.round(platformStudentScores.reduce((sum, ps) => sum + ps.contests_participated, 0) / count)
      : 0;

    const Icon = iconMap[platform.icon as keyof typeof iconMap] || Code;

    return {
      platform,
      Icon,
      avgProblems,
      avgRating,
      avgContests,
      count
    };
  });

  // Calculate overall metrics
  const totalStudents = students.length;
  const totalPlatformScores = platformScores.reduce((sum, ps) => sum + ps.score, 0);
  const avgOverallScore = totalStudents > 0 ? Math.round(totalPlatformScores / totalStudents) : 0;

  // Group platform scores by student
  const studentScoresMap = new Map();
  platformScores.forEach(ps => {
    if (!studentScoresMap.has(ps.student_id)) {
      studentScoresMap.set(ps.student_id, []);
    }
    studentScoresMap.get(ps.student_id).push(ps);
  });

  const handleAdd = () => {
    setEditingStudent(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setIsDialogOpen(true);
  };

  const handleSave = async (student: Student) => {
    try {
      if (editingStudent) {
        await updateStudentMutation.mutateAsync(student);
      } else {
        await createStudentMutation.mutateAsync(student);
      }
      setIsDialogOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Multi-Platform Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive coding platform analytics</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Overall Score</p>
                  <p className="text-2xl font-bold">{avgOverallScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Trophy className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Platforms</p>
                  <p className="text-2xl font-bold">{platforms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Code className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Platform Entries</p>
                  <p className="text-2xl font-bold">{platformScores.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Average Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Average Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformMetrics.map(({ platform, Icon, avgProblems, avgRating, avgContests, count }) => (
                <Card key={platform.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {platform.name}
                      <Badge variant="secondary" className="ml-auto">
                        {count} students
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Avg Problems</p>
                        <p className="font-medium text-lg">{avgProblems}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Avg Rating</p>
                        <p className="font-medium text-lg">{avgRating}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Avg Contests</p>
                        <p className="font-medium text-lg">{avgContests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Students List with Platform Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Students Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students added yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    {platforms.map(platform => (
                      <TableHead key={platform.id} className="text-center">
                        {platform.name} Score
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Total Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const studentScores = studentScoresMap.get(student.id) || [];
                    const totalScore = studentScores.reduce((sum: number, ps: any) => sum + ps.score, 0);
                    
                    return (
                      <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(student)}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          <Badge variant={student.isActive ? "default" : "destructive"}>
                            {student.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {platforms.map(platform => {
                          const platformScore = studentScores.find((ps: any) => ps.platform_id === platform.id);
                          return (
                            <TableCell key={platform.id} className="text-center">
                              {platformScore ? (
                                <Badge variant="secondary">{platformScore.score}</Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <Badge variant="default" className="bg-primary">
                            {totalScore}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <StudentPlatformDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          student={editingStudent}
          onSave={handleSave}
        />
      </div>
    </Layout>
  );
};

export default Index;
