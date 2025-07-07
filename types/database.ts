export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          role: 'teacher' | 'student' | 'admin';
          institute_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          role?: 'teacher' | 'student' | 'admin';
          institute_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          role?: 'teacher' | 'student' | 'admin';
          institute_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      classes: {
        Row: {
          id: string;
          name: string;
          subject: string;
          grade: string;
          description: string | null;
          teacher_id: string;
          schedule: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          subject: string;
          grade: string;
          description?: string | null;
          teacher_id: string;
          schedule?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          subject?: string;
          grade?: string;
          description?: string | null;
          teacher_id?: string;
          schedule?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      class_students: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          enrolled_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          enrolled_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          enrolled_at?: string;
          is_active?: boolean;
        };
      };
      attendance: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          date: string;
          status: 'present' | 'absent' | 'late';
          marked_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          date: string;
          status: 'present' | 'absent' | 'late';
          marked_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          date?: string;
          status?: 'present' | 'absent' | 'late';
          marked_by?: string;
          created_at?: string;
        };
      };
      resources: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          description: string | null;
          file_url: string | null;
          file_type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          title: string;
          description?: string | null;
          file_url?: string | null;
          file_type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          title?: string;
          description?: string | null;
          file_url?: string | null;
          file_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      tests: {
        Row: {
          id: string;
          class_id: string;
          title: string;
          description: string | null;
          type: 'mcq' | 'subjective' | 'mixed';
          total_marks: number;
          duration_minutes: number;
          created_by: string;
          is_published: boolean;
          start_time: string | null;
          end_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          title: string;
          description?: string | null;
          type: 'mcq' | 'subjective' | 'mixed';
          total_marks: number;
          duration_minutes: number;
          created_by: string;
          is_published?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          title?: string;
          description?: string | null;
          type?: 'mcq' | 'subjective' | 'mixed';
          total_marks?: number;
          duration_minutes?: number;
          created_by?: string;
          is_published?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
        };
      };
      test_results: {
        Row: {
          id: string;
          test_id: string;
          student_id: string;
          score: number;
          total_marks: number;
          percentage: number;
          submitted_at: string;
          answers: any;
        };
        Insert: {
          id?: string;
          test_id: string;
          student_id: string;
          score: number;
          total_marks: number;
          percentage: number;
          submitted_at?: string;
          answers: any;
        };
        Update: {
          id?: string;
          test_id?: string;
          student_id?: string;
          score?: number;
          total_marks?: number;
          percentage?: number;
          submitted_at?: string;
          answers?: any;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'class' | 'test' | 'announcement' | 'reminder';
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: 'class' | 'test' | 'announcement' | 'reminder';
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'class' | 'test' | 'announcement' | 'reminder';
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}