
CREATE OR REPLACE VIEW public.album_purchases WITH (security_invoker = true, security_barrier = false) AS 
SELECT * FROM contak.album_purchases WHERE deleted_at > NOW();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_purchases TO authenticated;

COMMENT ON VIEW public.album_purchases IS 'Modifible view on contak.album_purchases. Returns only NON-deleted album purchases';
