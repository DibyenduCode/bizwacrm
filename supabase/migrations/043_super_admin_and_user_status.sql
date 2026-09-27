-- ============================================================
-- 043_super_admin_and_user_status.sql
--
-- Super Admin and user approval system:
--   1. Add `status` ('pending', 'active', 'deactivated') to profiles
--   2. Add `is_super_admin` BOOLEAN to profiles
--   3. Update handle_new_user() to set status='pending' by default
--   4. Add RLS policies for Super Admin
-- ============================================================

-- 1. Add status and is_super_admin columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'active', 'deactivated'));

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_super_admin ON profiles(is_super_admin);

-- 2. Ensure any existing profiles are active
UPDATE profiles SET status = 'active' WHERE status = 'pending' OR status IS NULL;

-- 3. Super Admin RLS access on profiles
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT is_super_admin FROM profiles WHERE user_id = auth.uid()) = TRUE
  );

DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (SELECT is_super_admin FROM profiles WHERE user_id = auth.uid()) = TRUE
  );

-- 4. Super Admin RLS access on accounts
DROP POLICY IF EXISTS "Super admins can view all accounts" ON accounts;
CREATE POLICY "Super admins can view all accounts" ON accounts
  FOR SELECT USING (
    (SELECT is_super_admin FROM profiles WHERE user_id = auth.uid()) = TRUE
  );

-- 5. Updated handle_new_user() trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_account_id UUID;
  v_is_super BOOLEAN;
  v_status TEXT;
BEGIN
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_is_super := COALESCE((NEW.raw_user_meta_data->>'is_super_admin')::boolean, false);

  IF v_is_super THEN
    v_status := 'active';
  ELSE
    v_status := 'pending';
  END IF;

  INSERT INTO public.accounts (name, owner_user_id)
  VALUES (COALESCE(NULLIF(v_full_name, ''), NEW.email, 'My account'), NEW.id)
  RETURNING id INTO v_account_id;

  INSERT INTO public.profiles (user_id, full_name, email, account_id, account_role, status, is_super_admin)
  VALUES (NEW.id, v_full_name, NEW.email, v_account_id, 'owner', v_status, v_is_super);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to bootstrap account/profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;
