
CREATE OR REPLACE VIEW public.owned_albums WITH (security_invoker = true, security_barrier = true) AS 
SELECT * FROM contak.albums 
WHERE auth.uid() IN (
	SELECT album_creators.creator_id 
	FROM public.album_creators 
	WHERE album_creators.is_owner AND album_creators.album_id = albums.album_id
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_albums TO authenticated;

-- SELECT contak.login_as_user('kanyewest');
-- SELECT * FROM owned_albums