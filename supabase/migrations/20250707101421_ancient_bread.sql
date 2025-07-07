/*
  # Initial Schema for Tution Ghar

  1. New Tables
    - `profiles` - User profiles for teachers, students, and admins
    - `classes` - Class information and management
    - `class_students` - Many-to-many relationship between classes and students
    - `attendance` - Student attendance tracking
    - `resources` - Class resources and materials
    - `tests` - Test and exam management
    - `test_results` - Student test results and scores
    - `notifications` - Push notifications and announcements

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure data access based on user roles and relationships

  3. Functions
    - Auto-create profile on user signup
    - Update timestamps automatically
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('teacher', 'student', 'admin');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
CREATE TYPE test_type AS ENUM ('mcq', 'subjective', 'mixed');
CREATE TYPE notification_type AS ENUM ('class', 'test', 'announcement', 'reminder');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role DEFAULT 'student',
  institute_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  subject text NOT NULL,
  grade text NOT NULL,
  description text,
  teacher_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  schedule text,
  color text DEFAULT '#6C63FF',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Class students junction table
CREATE TABLE IF NOT EXISTS class_students (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  enrolled_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(class_id, student_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  status attendance_status NOT NULL,
  marked_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_id, student_id, date)
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  file_url text,
  file_type text,
  uploaded_by uuid REFERENCES profiles(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type test_type NOT NULL,
  total_marks integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  is_published boolean DEFAULT false,
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id uuid REFERENCES tests(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total_marks integer NOT NULL,
  percentage decimal(5,2) NOT NULL DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  answers jsonb,
  UNIQUE(test_id, student_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Teachers can view student profiles in their classes"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'student' AND id IN (
      SELECT cs.student_id FROM class_students cs
      JOIN classes c ON c.id = cs.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

-- Classes policies
CREATE POLICY "Teachers can manage their own classes"
  ON classes FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Students can view classes they're enrolled in"
  ON classes FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT class_id FROM class_students
      WHERE student_id = auth.uid() AND is_active = true
    )
  );

-- Class students policies
CREATE POLICY "Teachers can manage students in their classes"
  ON class_students FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own enrollments"
  ON class_students FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Attendance policies
CREATE POLICY "Teachers can manage attendance for their classes"
  ON attendance FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Resources policies
CREATE POLICY "Teachers can manage resources for their classes"
  ON resources FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view resources for their classes"
  ON resources FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT cs.class_id FROM class_students cs
      WHERE cs.student_id = auth.uid() AND cs.is_active = true
    )
  );

-- Tests policies
CREATE POLICY "Teachers can manage tests for their classes"
  ON tests FOR ALL
  TO authenticated
  USING (
    class_id IN (
      SELECT id FROM classes WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view published tests for their classes"
  ON tests FOR SELECT
  TO authenticated
  USING (
    is_published = true AND class_id IN (
      SELECT cs.class_id FROM class_students cs
      WHERE cs.student_id = auth.uid() AND cs.is_active = true
    )
  );

-- Test results policies
CREATE POLICY "Teachers can view results for their class tests"
  ON test_results FOR SELECT
  TO authenticated
  USING (
    test_id IN (
      SELECT t.id FROM tests t
      JOIN classes c ON c.id = t.class_id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own test results"
  ON test_results FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own test results"
  ON test_results FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_students_class_id ON class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student_id ON class_students(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_resources_class_id ON resources(class_id);
CREATE INDEX IF NOT EXISTS idx_tests_class_id ON tests(class_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_student_id ON test_results(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);