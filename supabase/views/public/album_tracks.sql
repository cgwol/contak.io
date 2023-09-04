
CREATE OR REPLACE VIEW public.album_tracks WITH (security_invoker = true) AS 
SELECT * FROM contak.album_tracks WHERE album_tracks.deleted_at > NOW();

REVOKE ALL ON public.album_tracks FROM PUBLIC, authenticated;
GRANT SELECT ON public.album_tracks TO authenticated;