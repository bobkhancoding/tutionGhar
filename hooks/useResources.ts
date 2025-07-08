import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Resource = Database['public']['Tables']['resources']['Row'];
type ResourceInsert = Database['public']['Tables']['resources']['Insert'];
type ResourceUpdate = Database['public']['Tables']['resources']['Update'];

export function useResources(classId?: string) {
  const queryClient = useQueryClient();

  const {
    data: resources,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['resources', classId],
    queryFn: async () => {
      let query = supabase
        .from('resources')
        .select(`
          *,
          profiles!resources_uploaded_by_fkey(full_name),
          classes!resources_class_id_fkey(name)
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

  const createResource = useMutation({
    mutationFn: async (resourceData: ResourceInsert) => {
      const { data, error } = await supabase
        .from('resources')
        .insert(resourceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const updateResource = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ResourceUpdate }) => {
      const { data, error } = await supabase
        .from('resources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  return {
    resources,
    isLoading,
    error,
    createResource,
    updateResource,
    deleteResource,
  };
}