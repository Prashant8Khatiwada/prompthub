-- Migration: Backfill creator profiles for existing auth users
-- This creates creator profiles for any auth users that don't have one yet

INSERT INTO creators (id, email, name, handle, subdomain, brand_color)
SELECT 
  u.id,
  u.email,
  INITCAP(LOWER(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))),
  '@' || LOWER(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')),
  LOWER(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[^a-zA-Z0-9]', '', 'g')),
  '#6366f1'
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM creators c WHERE c.id = u.id)
  AND NOT EXISTS (
    SELECT 1 FROM creators c 
    WHERE c.subdomain = LOWER(REGEXP_REPLACE(SPLIT_PART(u.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
  )
ON CONFLICT (id) DO NOTHING;
