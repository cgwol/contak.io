
CREATE OR REPLACE VIEW public.owned_tracks WITH (security_invoker = true, security_barrier = true, check_option = 'local') AS 
SELECT * FROM contak.tracks 
WHERE auth.uid() IN (
	SELECT track_creators.creator_id 
	FROM public.track_creators 
	WHERE track_creators.is_owner AND track_creators.track_id = tracks.track_id
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_tracks TO authenticated;

