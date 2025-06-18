
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface StudentPlatform {
  id: string;
  student_id: string;
  platform_id: string;
  handle: string;
  current_rating: number;
  max_rating: number;
  problems_solved: number;
  contests_participated: number;
  last_synced: string;
  platform?: Platform;
}

export interface PlatformScore {
  id: string;
  student_id: string;
  platform_id: string;
  score: number;
  problems_solved: number;
  avg_rating: number;
  contests_participated: number;
  last_calculated: string;
  platform?: Platform;
}

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Platform[];
    },
  });
};

export const useStudentPlatforms = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-platforms', studentId],
    queryFn: async () => {
      let query = supabase
        .from('student_platforms')
        .select(`
          *,
          platform:platforms(*)
        `);
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudentPlatform[];
    },
    enabled: !!studentId,
  });
};

export const usePlatformScores = () => {
  return useQuery({
    queryKey: ['platform-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_scores')
        .select(`
          *,
          platform:platforms(*)
        `)
        .order('score', { ascending: false });
      
      if (error) throw error;
      return data as PlatformScore[];
    },
  });
};

export const useCreateStudentPlatform = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (studentPlatform: Omit<StudentPlatform, 'id' | 'created_at' | 'updated_at' | 'last_synced'>) => {
      const { data, error } = await supabase
        .from('student_platforms')
        .insert(studentPlatform)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-platforms'] });
      toast({
        title: "Success",
        description: "Platform handle added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add platform handle.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudentPlatform = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StudentPlatform> & { id: string }) => {
      const { data, error } = await supabase
        .from('student_platforms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-platforms'] });
      toast({
        title: "Success",
        description: "Platform handle updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update platform handle.",
        variant: "destructive",
      });
    },
  });
};
