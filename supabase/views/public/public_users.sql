
CREATE OR REPLACE VIEW public.public_users WITH (security_invoker = true) AS 
SELECT 
	user_id, 
	username, 
	first_name, 
	last_name, 
	gender, 
	user_type 
FROM contak.users 
WHERE users.deleted_at > NOW();

GRANT SELECT ON public.public_users TO authenticated;