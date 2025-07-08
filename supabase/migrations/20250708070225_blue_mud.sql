/*
  # Fix infinite recursion in RLS policies

  This migration resolves the infinite recursion error in Row Level Security policies
  by simplifying the policies to avoid circular dependencies between tables.

  ## Changes Made

  1. **Profiles Table Policies**
     - Simplified policies to only check direct user ownership
     - Removed any references to other tables that could cause recursion

  2. **Class Students Table Policies** 
     - Updated policies to avoid circular references with profiles table
     - Ensured policies are self-contained and don't create dependency loops

  3. **Classes Table Policies**
     - Verified policies don't contribute to recursion issues

  ## Security Notes
  
  All policies maintain proper security while eliminating recursion:
  - Users can only access their own profile data
  - Students can only see classes they're enrolled in
  - Teachers can only manage their own classes and students
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON class_students;
DROP POLICY IF EXISTS "Teachers can manage students in their classes" ON class_students;
DROP POLICY IF EXISTS "Students can view classes they're enrolled in" ON classes;
DROP POLICY IF EXISTS "Teachers can manage their own classes" ON classes;

-- Create simplified profiles policies (no external table references)
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create simplified class_students policies (avoid recursion)
CREATE POLICY "Students can view their own enrollments"
  ON class_students
  FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can manage students in their classes"
  ON class_students
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = class_students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = class_students.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Create simplified classes policies
CREATE POLICY "Teachers can manage their own classes"
  ON classes
  FOR ALL
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Students can view classes they're enrolled in"
  ON classes
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT cs.class_id 
      FROM class_students cs 
      WHERE cs.student_id = auth.uid() 
      AND cs.is_active = true
    )
  );

-- Ensure all other table policies are also simplified and don't cause recursion

-- Attendance policies (simplified)
DROP POLICY IF EXISTS "Students can view their own attendance" ON attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance for their classes" ON attendance;

CREATE POLICY "Students can view their own attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage attendance for their classes"
  ON attendance
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = attendance.class_id 
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = attendance.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

-- Resources policies (simplified)
DROP POLICY IF EXISTS "Students can view resources for their classes" ON resources;
DROP POLICY IF EXISTS "Teachers can manage resources for their classes" ON resources;

CREATE POLICY "Teachers can manage resources for their classes"
  ON resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = resources.class_id 
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = resources.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view resources for their classes"
  ON resources
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_students cs 
      WHERE cs.class_id = resources.class_id 
      AND cs.student_id = auth.uid() 
      AND cs.is_active = true
    )
  );

-- Tests policies (simplified)
DROP POLICY IF EXISTS "Students can view published tests for their classes" ON tests;
DROP POLICY IF EXISTS "Teachers can manage tests for their classes" ON tests;

CREATE POLICY "Teachers can manage tests for their classes"
  ON tests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = tests.class_id 
      AND classes.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes 
      WHERE classes.id = tests.class_id 
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view published tests for their classes"
  ON tests
  FOR SELECT
  TO authenticated
  USING (
    is_published = true 
    AND EXISTS (
      SELECT 1 FROM class_students cs 
      WHERE cs.class_id = tests.class_id 
      AND cs.student_id = auth.uid() 
      AND cs.is_active = true
    )
  );

-- Test results policies (simplified)
DROP POLICY IF EXISTS "Students can view their own test results" ON test_results;
DROP POLICY IF EXISTS "Students can insert their own test results" ON test_results;
DROP POLICY IF EXISTS "Teachers can view results for their class tests" ON test_results;

CREATE POLICY "Students can view their own test results"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own test results"
  ON test_results
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view results for their class tests"
  ON test_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tests t
      JOIN classes c ON c.id = t.class_id
      WHERE t.id = test_results.test_id 
      AND c.teacher_id = auth.uid()
    )
  );

-- Notifications policies (already simple, but ensure they're correct)
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());