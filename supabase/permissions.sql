-- contak Permissions
GRANT USAGE ON SCHEMA contak TO authenticated;

GRANT SELECT ON contak.primary_keys TO authenticated;

GRANT SELECT ON contak.foreign_key_relations TO authenticated;

GRANT SELECT ON contak.creators TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON contak.albums TO authenticated;
GRANT USAGE ON SEQUENCE contak.albums_album_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON contak.album_creators TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON contak.users TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON contak.album_tracks TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON contak.tracks TO authenticated;
GRANT USAGE ON SEQUENCE contak.tracks_track_id_seq TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE, TRIGGER ON contak.track_creators TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON contak.album_purchases TO authenticated;
--to do: add controls on album purchases


--public Permissions
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.public_users TO authenticated;

GRANT SELECT ON public.public_albums TO authenticated;

GRANT SELECT ON public.public_tracks TO authenticated;

REVOKE ALL ON public.album_tracks FROM PUBLIC, authenticated;
GRANT SELECT ON public.album_tracks TO authenticated;

REVOKE ALL ON public.public_settings FROM authenticated, anon, PUBLIC;
GRANT SELECT ON public.public_settings TO authenticated, anon, PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.album_creators TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.track_creators TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_albums TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_album_tracks TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.owned_tracks TO authenticated;

GRANT SELECT ON public.my_albums TO authenticated;

GRANT SELECT ON public.my_tracks TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.my_profile TO authenticated;

GRANT SELECT ON public.my_purchased_albums TO authenticated;