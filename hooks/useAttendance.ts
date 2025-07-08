import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Attendance = Database['public']['Tables']['attendance']['Row'];
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];

export function useAttendance(classId?: string, date?: string) {
  const queryClient = useQueryClient();

  const {
    data: attendance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendance', classId, date],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          profiles!attendance_student_id_fkey(full_name, email),
          classes!attendance_class_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const markAttendance = useMutation({
    mutationFn: async (attendanceData: AttendanceInsert) => {
      const { data, error } = await supabase
        .from('attendance')
        .upsert(attendanceData, {
          onConflict: 'class_id,student_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AttendanceUpdate }) => {
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  const deleteAttendance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });

  return {
    attendance,
    isLoading,
    error,
    markAttendance,
    updateAttendance,
    deleteAttendance,
  };
}

export function useAttendanceStats(teacherId?: string) {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendance-stats', teacherId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          status,
          classes!inner(teacher_id)
        `)
        .eq('classes.teacher_id', teacherId);

      if (error) throw error;

      const total = data.length;
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      const late = data.filter(a => a.status === 'late').length;

      return {
        total,
        present,
        absent,
        late,
        presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    },
    enabled: !!teacherId,
  });

  return {
    stats,
    isLoading,
    error,
  };
}