
import { useState } from 'react';
import { Student } from '@/types/student';
import { Layout } from '@/components/Layout';
import { StudentsTable } from '@/components/StudentsTable';
import { StudentProfile } from '@/components/StudentProfile';

const Codeforces = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Codeforces Students</h1>
          <p className="text-muted-foreground">Manage and track student progress on Codeforces</p>
        </div>
        
        {selectedStudent ? (
          <StudentProfile 
            student={selectedStudent} 
            onBack={() => setSelectedStudent(null)} 
          />
        ) : (
          <StudentsTable onViewStudent={setSelectedStudent} />
        )}
      </div>
    </Layout>
  );
};

export default Codeforces;
