-- Migration: Add trigger to auto-create creator profile on auth signup
-- This ensures a creator profile is automatically created when a new user signs up

-- Create a function to handle the trigger
CREATE OR REPLACE FUNCTION create_creator_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate handle from email prefix
  DECLARE
    email_prefix TEXT;
    sanitized_prefix TEXT;
  BEGIN
    email_prefix := SPLIT_PART(NEW.email, '@', 1);
    sanitized_prefix := LOWER(REGEXP_REPLACE(email_prefix, '[^a-zA-Z0-9]', '', 'g'));
    
    INSERT INTO creators (
      id,
      email,
      name,
      handle,
      subdomain,
      brand_color
    ) VALUES (
      NEW.id,
      NEW.email,
      INITCAP(sanitized_prefix),
      '@' || sanitized_prefix,
      sanitized_prefix,
      '#6366f1'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_creator_profile();
