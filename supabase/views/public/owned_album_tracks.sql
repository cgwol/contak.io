
CREATE OR REPLACE VIEW public.owned_album_tracks WITH (security_invoker = true, security_barrier = true) AS 
SELECT * FROM contak.album_tracks 
WHERE EXISTS(SELECT 1 FROM public.owned_albums WHERE owned_albums.album_id = album_tracks.album_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_album_tracks TO authenticated;