-- Fix infinite recursion in RLS policies for users table
-- The issue: Admin policies query the users table, which triggers RLS again

-- Drop the problematic admin policies
DROP POLICY IF EXISTS "Admins can read all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Recreate admin policies using auth.jwt() to check is_admin from JWT claims
-- This avoids querying the users table within the policy
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = TRUE
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Actually, the above still has the recursion issue. Let's use a simpler approach:
-- Only allow admins to read all users if we can check without recursion
-- Better solution: Use a function that bypasses RLS for the check

-- Drop and recreate with a function-based approach
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create a function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id
    AND is_admin = TRUE
  );
END;
$$;

-- Now create the policy using the function
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

