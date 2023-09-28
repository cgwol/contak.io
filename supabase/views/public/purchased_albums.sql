
CREATE OR REPLACE VIEW public.purchased_albums WITH (security_invoker = true, security_barrier = true) AS 
SELECT * FROM contak.album_purchases
WHERE (album_purchases.user_id = auth.uid() AND album_purchases.deleted_at > NOW());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchased_albums TO authenticated;

COMMENT ON VIEW public.album_purchases IS 'Modifible view on contak.album_purchases. Returns only NON-deleted album purchases';

-- SELECT contak.login_as_user('piper');
-- SELECT * FROM purchased_albums