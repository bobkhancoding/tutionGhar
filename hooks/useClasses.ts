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
      let query = supabase
        .from('classes')
        .select(`
          *,
          class_students(count),
          profiles!classes_teacher_id_fkey(full_name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!teacherId,
  });

  const createClass = useMutation({
    mutationFn: async (classData: ClassInsert) => {
      const { data, error } = await supabase
        .from('classes')
        .insert(classData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ClassUpdate }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('class_students')
        .select(`
          *,
          profiles!class_students_student_id_fkey(*)
        `)
        .eq('class_id', classId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const enrollStudent = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) => {
      const { data, error } = await supabase
        .from('class_students')
        .insert({
          class_id: classId,
          student_id: studentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-students', classId] });
    },
  });

  const removeStudent = useMutation({
    mutationFn: async ({ studentId }: { studentId: string }) => {
      const { error } = await supabase
        .from('class_students')
        .update({ is_active: false })
        .eq('class_id', classId)
        .eq('student_id', studentId);

      if (error) throw error;
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