
import { useState, useMemo } from 'react';
import { Student } from '@/types/student';
import { mockStudents } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Edit, Trash2, Plus, Download, Search } from 'lucide-react';
import { StudentDialog } from './StudentDialog';
import { toast } from '@/hooks/use-toast';

interface StudentsTableProps {
  onViewStudent: (student: Student) => void;
}

export function StudentsTable({ onViewStudent }: StudentsTableProps) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    toast({
      title: "Student deleted",
      description: "Student has been successfully removed.",
    });
  };

  const handleSaveStudent = (student: Student) => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === student.id ? student : s));
      toast({
        title: "Student updated",
        description: "Student information has been updated successfully.",
      });
    } else {
      const newStudent = { ...student, id: Date.now().toString() };
      setStudents(prev => [...prev, newStudent]);
      toast({
        title: "Student added",
        description: "New student has been added successfully.",
      });
    }
    setDialogOpen(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Codeforces Handle', 'Current Rating', 'Max Rating', 'Last Updated', 'Status'];
    const csvData = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.name,
        student.email,
        student.phone,
        student.codeforcesHandle,
        student.currentRating,
        student.maxRating,
        student.lastUpdated.toLocaleDateString(),
        student.isActive ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Student data has been exported to CSV.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddStudent} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
              <Button variant="outline" onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>CF Handle</TableHead>
                  <TableHead className="hidden lg:table-cell">Current Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Max Rating</TableHead>
                  <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {student.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{student.phone}</TableCell>
                    <TableCell>
                      <code className="bg-muted px-1 py-0.5 rounded text-sm">
                        {student.codeforcesHandle}
                      </code>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary">{student.currentRating}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline">{student.maxRating}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {student.lastUpdated.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.isActive ? "default" : "destructive"}>
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewStudent(student)}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStudent(student)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStudent(student.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editingStudent}
        onSave={handleSaveStudent}
      />
    </div>
  );
}
