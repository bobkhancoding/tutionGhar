import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Class = Database['public']['Tables']['classes']['Row'];
type ClassInsert = Database['public']['Tables']['classes']['Insert'];
type ClassUpdate = Database['public']['Tables']['classes']['Update'];

export function useClasses(teacherId?: string) {
  const queryClient = useQueryClient();

  const {
    data: classes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['classes', teacherId],
    queryFn: async () => {
      console.log('Fetching classes for teacher:', teacherId);
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacherId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching classes:', error);
        throw error;
      }
      
      console.log('Classes fetched successfully:', data?.length);
      return data;
    },
    enabled: !!teacherId,
  });

  const createClass = useMutation({
    mutationFn: async (classData: ClassInsert) => {
      console.log('Creating class:', classData);
      
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();

      if (error) {
        console.error('Error creating class:', error);
        throw error;
      }
      
      console.log('Class created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClassUpdate }) => {
      console.log('Updating class:', id, updates);
      
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating class:', error);
        throw error;
      }
      
      console.log('Class updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting class:', id);
      
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting class:', error);
        throw error;
      }
      
      console.log('Class deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  return {
    classes,
    isLoading,
    error,
    createClass,
    updateClass,
    deleteClass,
  };
}

export function useClassStudents(classId: string) {
  const queryClient = useQueryClient();

  const {
    data: students,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: async () => {
      console.log('Fetching students for class:', classId);
      
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          *,
          profiles!class_students_student_id_fkey(*)
        `)
        .eq('class_id', classId)
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching class students:', error);
        throw error;
      }
      
      console.log('Class students fetched successfully:', data?.length);
      return data;
    },
    enabled: !!classId,
  });

  const enrollStudent = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) => {
      console.log('Enrolling student:', studentId, 'in class:', classId);
      
      const { data, error } = await supabase
        .from('class_students')
        .insert({
          class_id: classId,
          student_id: studentId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error enrolling student:', error);
        throw error;
      }
      
      console.log('Student enrolled successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
    },
  });

  const removeStudent = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) => {
      console.log('Removing student:', studentId, 'from class:', classId);
      
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) {
        console.error('Error removing student:', error);
        throw error;
      }
      
      console.log('Student removed successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
    },
  });

  return {
    students,
    isLoading,
    error,
    enrollStudent,
    removeStudent,
  };
}