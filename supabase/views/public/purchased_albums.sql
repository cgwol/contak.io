
CREATE OR REPLACE VIEW public.purchased_albums WITH (security_invoker = true, security_barrier = true) AS 
SELECT * FROM contak.album_purchases
WHERE auth.uid() IN (
	SELECT album_purchases.user_id 
	FROM public.album_purchases
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchased_albums TO authenticated;

-- SELECT contak.login_as_user('piper');
-- SELECT * FROM purchased_albums