import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useStudents(teacherId?: string) {
  const queryClient = useQueryClient();

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['students', teacherId],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          class_students!inner(
            class_id,
            classes!inner(teacher_id)
          )
        `)
        .eq('role', 'student');

      if (teacherId) {
        query = query.eq('class_students.classes.teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  return {
    students,
    isLoading,
    error,
    updateStudent,
  };
}

export function useAllStudents() {
  const {
    data: allStudents,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (error) throw error;
      return data;
    },
  });

  return {
    allStudents,
    isLoading,
    error,
  };
}