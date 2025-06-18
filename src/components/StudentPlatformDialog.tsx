
import { useState, useEffect } from 'react';
import { Student } from '@/types/student';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlatforms, useStudentPlatforms, useCreateStudentPlatform } from '@/hooks/usePlatforms';

interface StudentPlatformDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSave: (student: Student) => void;
}

export function StudentPlatformDialog({ open, onOpenChange, student, onSave }: StudentPlatformDialogProps) {
  const { data: platforms = [] } = usePlatforms();
  const { data: studentPlatforms = [] } = useStudentPlatforms(student?.id);
  const createStudentPlatformMutation = useCreateStudentPlatform();

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    email: '',
    phone: '',
    codeforcesHandle: '',
    currentRating: 0,
    maxRating: 0,
    isActive: true,
    emailEnabled: true,
    reminderEmailsSent: 0,
  });

  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData(student);
      // Pre-populate platform handles if they exist
      const handles: Record<string, string> = {};
      studentPlatforms.forEach(sp => {
        if (sp.platform) {
          handles[sp.platform.name] = sp.handle;
        }
      });
      setPlatformHandles(handles);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
        currentRating: 0,
        maxRating: 0,
        isActive: true,
        emailEnabled: true,
        reminderEmailsSent: 0,
      });
      setPlatformHandles({});
    }
  }, [student, studentPlatforms, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData: Student = {
      id: student?.id || Date.now().toString(),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      codeforcesHandle: platformHandles['Codeforces'] || formData.codeforcesHandle || '',
      currentRating: formData.currentRating || 0,
      maxRating: formData.maxRating || 0,
      lastUpdated: new Date(),
      isActive: formData.isActive || true,
      reminderEmailsSent: formData.reminderEmailsSent || 0,
      emailEnabled: formData.emailEnabled || true,
    };

    // Save student first
    onSave(studentData);

    // If creating a new student, save platform handles
    if (!student && studentData.id) {
      for (const platform of platforms) {
        const handle = platformHandles[platform.name];
        if (handle && handle.trim()) {
          try {
            await createStudentPlatformMutation.mutateAsync({
              student_id: studentData.id,
              platform_id: platform.id,
              handle: handle.trim(),
              current_rating: 0,
              max_rating: 0,
              problems_solved: 0,
              contests_participated: 0,
            });
          } catch (error) {
            console.error(`Failed to save ${platform.name} handle:`, error);
          }
        }
      }
    }
  };

  const updateField = (field: keyof Student, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePlatformHandle = (platformName: string, handle: string) => {
    setPlatformHandles(prev => ({ ...prev, [platformName]: handle }));
    // Update codeforcesHandle in formData for backwards compatibility
    if (platformName === 'Codeforces') {
      updateField('codeforcesHandle', handle);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {student ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => updateField('isActive', checked)}
                  />
                  <Label htmlFor="active">Active Student</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailEnabled"
                    checked={formData.emailEnabled}
                    onCheckedChange={(checked) => updateField('emailEnabled', checked)}
                  />
                  <Label htmlFor="emailEnabled">Email Notifications</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Handles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Handles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {platforms.map((platform) => (
                  <div key={platform.id} className="space-y-2">
                    <Label htmlFor={platform.name}>{platform.name} Handle</Label>
                    <Input
                      id={platform.name}
                      value={platformHandles[platform.name] || ''}
                      onChange={(e) => updatePlatformHandle(platform.name, e.target.value)}
                      placeholder={`Enter ${platform.name} username`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
