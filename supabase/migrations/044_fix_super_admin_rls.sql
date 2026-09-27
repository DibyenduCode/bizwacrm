CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
    false
  );
$$;

DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;

CREATE POLICY "Super admins can view all profiles" ON profiles
  FOR SELECT USING (
    (auth.uid() = user_id) OR public.is_super_admin()
  );

CREATE POLICY "Super admins can update all profiles" ON profiles
  FOR UPDATE USING (
    (auth.uid() = user_id) OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Super admins can view all accounts" ON accounts;
CREATE POLICY "Super admins can view all accounts" ON accounts
  FOR SELECT USING (
    public.is_super_admin()
  );
