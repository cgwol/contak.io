
CREATE OR REPLACE VIEW public.track_creators WITH (security_invoker = true, security_barrier = false) AS 
SELECT * FROM contak.track_creators WHERE deleted_at > NOW();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.track_creators TO authenticated;

COMMENT ON VIEW public.track_creators IS 'Modifible view on contak.track_creators. Returns only NON-deleted track creators';