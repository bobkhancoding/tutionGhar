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
      console.log('Fetching students for teacher:', teacherId);
      
      // Get all students who are enrolled in classes taught by this teacher
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *
        `)
        .eq('role', 'student');

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }
      
      console.log('Students fetched successfully:', data?.length);
      return data;
    },
    enabled: !!teacherId,
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Profile> }) => {
      console.log('Updating student:', id, updates);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating student:', error);
        throw error;
      }
      
      console.log('Student updated successfully:', data);
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
      console.log('Fetching all students');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (error) {
        console.error('Error fetching all students:', error);
        throw error;
      }
      
      console.log('All students fetched successfully:', data?.length);
      return data;
    },
  });

  return {
    allStudents,
    isLoading,
    error,
  };
}