
CREATE OR REPLACE VIEW public.my_profile WITH (security_invoker = true, security_barrier = true, check_option = 'local') AS 
SELECT
  users.user_id,
  users.username,
  users.first_name,
  users.last_name,
  users.birthday,
  users.gender,
  users.user_type,
  users.deleted_at,
  (
    SELECT
      array_agg(objects.name) AS array_agg
    FROM
      storage.objects
    WHERE
      objects.bucket_id = 'profile_pictures'
      AND objects.name LIKE (users.user_id || '/%')
  ) AS profile_pictures
FROM
  contak.users
where
  users.user_id = auth.uid();
  
GRANT SELECT, INSERT, UPDATE, DELETE ON public.my_profile TO authenticated;