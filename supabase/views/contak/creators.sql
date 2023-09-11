create or replace view contak.creators as  SELECT users.user_id,
    users.username,
    users.first_name,
    users.last_name,
    users.birthday,
    users.gender,
    users.user_type,
    users.deleted_at
   FROM contak.users
  WHERE (users.user_type = 'Creator'::contak.user_type);
  
  GRANT SELECT ON contak.creators TO authenticated;