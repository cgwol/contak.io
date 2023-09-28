CREATE TABLE IF NOT EXISTS contak.album_purchases (
    user_id UUID NOT NULL,
    album_id BIGINT NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	deleted_at TIMESTAMPTZ NOT NULL DEFAULT 'infinity',
    PRIMARY KEY(user_id, album_id),
    CONSTRAINT fk_userid
        FOREIGN KEY (user_id)
            REFERENCES contak.users(user_id),
    CONSTRAINT fk_albumid
        FOREIGN KEY (album_id)
            REFERENCES contak.albums(album_id)
);

COMMENT ON TABLE contak.album_purchases IS 'Tracks relationship between users and the albums they have purchased'

---

CREATE OR REPLACE VIEW public.purchased_albums WITH (security_invoker = true, security_barrier = true) AS 
SELECT * FROM contak.album_purchases
WHERE (album_purchases.user_id = auth.uid() AND album_purchases.deleted_at > NOW());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchased_albums TO authenticated;

COMMENT ON VIEW public.purchased_albums IS 'Modifible view on contak.album_purchases. Returns only NON-deleted album purchases';

-- SELECT contak.login_as_user('piper');
-- SELECT * FROM purchased_albums

---

CREATE OR REPLACE VIEW public.public_albums WITH (security_invoker = true) AS 
SELECT albums.album_id, albums.album_name, albums.created_at, creators.album_creators, tracks.album_tracks, covers.album_covers,
EXISTS (
	SELECT * FROM public.purchased_albums WHERE purchased_albums.album_id = albums.album_id
) AS is_purchased_by_user
FROM contak.albums
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'creator_id', album_creators.creator_id, 
		'username', public_users.username,
		'first_name', public_users.first_name,
		'last_name', public_users.last_name,
		'gender', public_users.gender
	--	'added_on', album_creators.created_at
	))) AS album_creators
	FROM contak.album_creators 
	LEFT JOIN public.public_users ON album_creators.creator_id = public_users.user_id
	WHERE album_creators.album_id = albums.album_id AND album_creators.deleted_at > NOW()
) AS creators(album_creators) ON true
JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(JSON_BUILD_OBJECT(
		'track_id', album_tracks.track_id,
		'track_name', tracks.track_name,
		'created_at', tracks.created_at,
		'track_creators', tracks.track_creators,
		'audio_files', tracks.audio_files
	)))
	FROM contak.album_tracks
	LEFT JOIN public.public_tracks AS tracks ON tracks.track_id = album_tracks.track_id
	WHERE album_tracks.album_id = albums.album_id AND album_tracks.deleted_at > NOW()
) AS tracks(album_tracks) ON true
LEFT JOIN LATERAL (
	SELECT array_to_json(ARRAY_AGG(objects.name))
	FROM storage.objects 
	WHERE objects.bucket_id = 'album_covers' AND objects.name LIKE albums.album_id || '/%'
) AS covers(album_covers) ON true
WHERE albums.deleted_at > NOW();


GRANT SELECT ON public.public_albums TO authenticated;

--

--Before INSERT, UPDATE, DELETE on contak.album_purchases
CREATE OR REPLACE FUNCTION contak.check_can_modify_album_purchases() 
RETURNS TRIGGER LANGUAGE plpgsql AS $$ 
DECLARE modified record = (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END);
BEGIN
	IF modified.user_id IS DISTINCT FROM auth.uid() THEN 
		RAISE EXCEPTION 'Permission denied: You can only purchase albums for yourself';
	END IF;
	RETURN modified;
END;
$$;

DROP TRIGGER IF EXISTS check_can_modify_album_purchases ON contak.album_purchases;
CREATE OR REPLACE TRIGGER check_can_modify_album_purchases BEFORE INSERT OR UPDATE OR DELETE ON contak.album_purchases
FOR EACH ROW EXECUTE FUNCTION contak.check_can_modify_album_purchases();
