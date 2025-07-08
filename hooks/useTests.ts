import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Test = Database['public']['Tables']['tests']['Row'];
type TestInsert = Database['public']['Tables']['tests']['Insert'];
type TestUpdate = Database['public']['Tables']['tests']['Update'];
type TestResult = Database['public']['Tables']['test_results']['Row'];
type TestResultInsert = Database['public']['Tables']['test_results']['Insert'];

export function useTests(classId?: string) {
  const queryClient = useQueryClient();

  const {
    data: tests,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tests', classId],
    queryFn: async () => {
      let query = supabase
        .from('tests')
        .select(`
          *,
          profiles!tests_created_by_fkey(full_name),
          classes!tests_class_id_fkey(name),
          test_results(count)
        `)
        .order('created_at', { ascending: false });

      if (classId) {
        query = query.eq('class_id', classId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  const createTest = useMutation({
    mutationFn: async (testData: TestInsert) => {
      const { data, error } = await supabase
        .from('tests')
        .insert(testData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  const updateTest = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TestUpdate }) => {
      const { data, error } = await supabase
        .from('tests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  const deleteTest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
    },
  });

  return {
    tests,
    isLoading,
    error,
    createTest,
    updateTest,
    deleteTest,
  };
}

export function useTestResults(testId?: string) {
  const queryClient = useQueryClient();

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['test-results', testId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          profiles!test_results_student_id_fkey(full_name, email),
          tests!test_results_test_id_fkey(title, total_marks)
        `)
        .eq('test_id', testId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });

  const submitResult = useMutation({
    mutationFn: async (resultData: TestResultInsert) => {
      const { data, error } = await supabase
        .from('test_results')
        .upsert(resultData, {
          onConflict: 'test_id,student_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-results'] });
    },
  });

  return {
    results,
    isLoading,
    error,
    submitResult,
  };
}