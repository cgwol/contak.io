
CREATE OR REPLACE VIEW public.album_creators WITH (security_invoker = true, security_barrier = false) AS 
SELECT * FROM contak.album_creators WHERE deleted_at > NOW();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_creators TO authenticated;

COMMENT ON VIEW public.album_creators IS 'Modifible view on contak.album_creators. Returns only NON-deleted album creators';
