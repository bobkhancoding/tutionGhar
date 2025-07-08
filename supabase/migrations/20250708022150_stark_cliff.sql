/*
  # Fix RLS Infinite Recursion Error

  1. Changes
    - Remove the problematic RLS policy "Teachers can view student profiles in their classes" from the profiles table
    - This policy was causing infinite recursion due to circular dependencies with class_students table policies
    - The application logic already handles filtering students by teacher ID through the useStudents hook
    - Other RLS policies on class_students and classes tables provide sufficient security

  2. Security
    - Maintains data security through existing policies on related tables
    - Teachers can still access student data through proper application-level filtering
*/

-- Remove the problematic RLS policy that causes infinite recursion
DROP POLICY IF EXISTS "Teachers can view student profiles in their classes" ON profiles;